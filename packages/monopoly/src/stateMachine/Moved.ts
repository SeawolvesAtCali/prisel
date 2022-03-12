import {
    Action,
    Anim,
    animationMap,
    ChanceInputArgs,
    exist,
    GamePlayer,
    Property,
} from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { assertExist, broadcast, Packet, Request, Response, TurnOrder } from '@prisel/server';
import { endState, newState, run, StateConfig, useLocalState, useSideEffect } from '@prisel/state';
import { chanceHandlers } from '../chanceHandlers/index';
import { getRand } from '../utils';
import { GameOverState } from './GameOver';
import { PreRollState } from './PreRoll';
import {
    getGame,
    getGamePlayer,
    getPanAnimationLength,
    PlayingAnimation,
    Requesting,
    usePlayerLeaveEvent,
} from './utils';

/**
 * This state starts after the current player moves to the destination after
 * roll and ends when camera pan to the next player on client side.
 * Upon entering this state, we will check if the current player encounters
 * anything.
 * If player needs to pay rent, server broadcasts
 * {@link Action.ANNOUNCE_PAY_RENT} to all clients.
 * Then server broadcasts `pay_rent` animation.
 * After `pay_rent` animation is finished (or not played), if player is
 * bankrupted, we transition to GameOver state.
 * Otherwise we check if the current player can invest in any property. Server
 * will request the current player with {@link Action.PROMPT_PURCHASE}.
 * If player confirms the investment, server broadcasts
 * {@link Action.ANNOUNCE_PURCHASE} and `invested` animation.
 * Finally server broadcasts {@link Action.ANNOUNCE_END_TURN} with the
 * next_player_id. Server also broadcasts `pan` animation.
 * When panning is done, move to next state PreRoll.
 * Server give the turn to next player right before transitioning state.
 *
 * Animation: pay_rent, invested, pan
 */
export function MovedState(props: { turnOrder: TurnOrder }) {
    const { turnOrder } = props;
    const currentPlayer = getGamePlayer(turnOrder.getCurrentPlayer());
    const [done, setDone] = useLocalState(false);
    const [gameOver, setGameOver] = useLocalState(false);
    useSideEffect(() => {
        run(function* () {
            let isGameOver = false;
            yield newState(ProcessingPropertyManagement, {
                onGameOver: () => {
                    isGameOver = true;
                    setGameOver(true);
                },
                turnOrder,
            });
            if (isGameOver) {
                return endState();
            }
            yield newState(ProcessingChance, {
                onGameOver: () => {
                    isGameOver = true;
                    setGameOver(true);
                },
                turnOrder,
            });
            if (isGameOver) {
                return endState();
            }
            if (!currentPlayer) {
                return endState();
            }
            const nextPlayer = turnOrder.getNextPlayerOf(turnOrder.getCurrentPlayer());
            broadcast(
                turnOrder.getAllPlayers(),
                Packet.forAction(Action.ANNOUNCE_END_TURN)
                    .setPayload(monopolypb.AnnounceEndTurnPayload, {
                        currentPlayer: currentPlayer.id,
                        nextPlayer: getGamePlayer(nextPlayer)?.id,
                    })
                    .build(),
            );
            const currentPlayerPos = assertExist(
                currentPlayer.pathTile?.get().position,
                'currentPlayerPos',
            );
            const nextPlayerPos = assertExist(
                currentPlayer.pathTile?.get().position,
                'nextPlayerPos',
            );

            yield newState(PlayingAnimation, {
                animation: Anim.create('pan', monopolypb.PanExtra)
                    .setExtra({
                        target: nextPlayerPos,
                    })
                    .setLength(getPanAnimationLength(currentPlayerPos, nextPlayerPos))
                    .build(),
                turnOrder,
            });

            turnOrder.giveTurnToNext();
            return endState({ onEnd: () => setDone(true) });
        });
    }, []);

    const leftPlayer = usePlayerLeaveEvent(turnOrder);
    if (leftPlayer || gameOver) {
        return newState(GameOverState, { turnOrder });
    }

    if (done) {
        return newState(PreRollState, { turnOrder });
    }
}

function* ProcessingPropertyManagement(props: { onGameOver: () => void; turnOrder: TurnOrder }) {
    const game = getGame();
    const { turnOrder, onGameOver } = props;
    const currentPlayer = getGamePlayer(turnOrder.getCurrentPlayer());

    const currentPathTile = assertExist(currentPlayer?.pathTile?.get(), 'currentPathTile');

    if (currentPathTile.hasProperties.length > 0 && currentPlayer) {
        const properties = currentPathTile.hasProperties.map((propertyRef) => propertyRef.get());
        const rentPayments: monopolypb.Payment[] = [];
        // check for rent payment first
        for (const property of properties) {
            if (property.owner && property.owner.id !== currentPlayer?.id) {
                rentPayments.push(
                    currentPlayer.payRent(property.owner.get(), property.getBasicPropertyInfo()),
                );
            }
        }
        if (rentPayments.length > 0) {
            // announce pay rent
            broadcast(turnOrder.getAllPlayers(), (player) => {
                return Packet.forAction(Action.ANNOUNCE_PAY_RENT)
                    .setPayload(monopolypb.AnnouncePayRentPayload, {
                        payer: currentPlayer.id,
                        payments: rentPayments,
                        myCurrentMoney: getGamePlayer(player)?.money || 0,
                    })
                    .build();
            });
            yield newState(PlayingAnimation, {
                animation: Anim.create('pay_rent', monopolypb.PayRentExtra)
                    .setExtra({
                        // TODO: here we assume we are paying one player only
                        payer: game.getGamePlayerById(rentPayments[0].payer)?.getGamePlayerInfo(),
                        payee: game.getGamePlayerById(rentPayments[0].payee)?.getGamePlayerInfo(),
                    })
                    .setLength(animationMap.pay_rent)
                    .build(),
                turnOrder,
            });
            if (currentPlayer.money < 0) {
                announceBankrupt(currentPlayer, turnOrder);
                onGameOver();
                return endState();
            }
        }

        if (properties.some((property) => property.investable(currentPlayer))) {
            for (const property of properties) {
                if (!property.investable(currentPlayer)) {
                    continue;
                }

                yield newState(PromptingForPurchase, { property, turnOrder });
            }
        }
    }

    return endState();
}

function* PromptingForPurchase(props: { property: Property; turnOrder: TurnOrder }) {
    const { turnOrder, property } = props;
    const currentPlayer = getGamePlayer(turnOrder.getCurrentPlayer());
    if (!currentPlayer) {
        return endState();
    }

    const propertyForPurchase = property.getPromptPurchaseRequest(
        currentPlayer,
        currentPlayer.money,
    );
    if (!propertyForPurchase) {
        return endState();
    }
    let response: Response | undefined = undefined;
    yield newState(Requesting, {
        player: currentPlayer,
        request: Request.forAction(Action.PROMPT_PURCHASE).setPayload(
            monopolypb.PromptPurchaseRequest,
            propertyForPurchase,
        ),
        callback: (resp) => (response = resp),
    });

    if (
        response &&
        Packet.isStatusOk(response) &&
        Packet.getPayload(response, monopolypb.PromptPurchaseResponse)?.purchased
    ) {
        currentPlayer.purchaseProperty(property, propertyForPurchase);
        // broadcast purchase
        broadcast(
            turnOrder.getAllPlayers(),
            Packet.forAction(Action.ANNOUNCE_PURCHASE)
                .setPayload(monopolypb.AnnouncePurchasePayload, {
                    player: currentPlayer.id,
                    property: property.getBasicPropertyInfo(),
                })
                .build(),
        );

        yield newState(PlayingAnimation, {
            animation: Anim.create('invested', monopolypb.InvestedExtra)
                .setExtra({ property: property.getBasicPropertyInfo() })
                .setLength(animationMap.invested)
                .build(),
            turnOrder,
        });
    }

    return endState();
}

function* ProcessingChance(props: { onGameOver: () => void; turnOrder: TurnOrder }) {
    const { turnOrder, onGameOver } = props;
    const currentPlayer = getGamePlayer(turnOrder.getCurrentPlayer());
    if (!currentPlayer) {
        return endState();
    }
    const currentTile = assertExist(currentPlayer.pathTile?.get(), 'currentTile');

    if (!exist(currentTile.chancePool)) {
        return endState();
    }

    // randomly select a chance
    const chanceInput = getRand(currentTile.chancePool);

    if (!exist(chanceInput)) {
        return endState();
    }
    yield newState(PlayingAnimation, {
        animation: Anim.create('open_chance_chest', monopolypb.OpenChanceChestExtra)
            .setExtra({
                chanceChestTile: currentTile.position,
                chance: chanceInput.display,
            })
            .setLength(animationMap.open_chance_chest)
            .build(),
        turnOrder,
    });

    // wait for current player to dismiss the chance card
    yield newState(Requesting, {
        player: currentPlayer,
        request: Request.forAction(Action.PROMPT_CHANCE_CONFIRMATION),
        callback: () => {
            // we don't care about the response.
        },
    });

    yield newState(PlayingAnimation, {
        animation: Anim.create('dismiss_chance_card')
            .setLength(animationMap.dismiss_chance_card)
            .build(),
        turnOrder,
    });

    const chanceType = (chanceInput.type as keyof ChanceInputArgs) || 'unspecified';
    let nextState: StateConfig<any> | null = null;
    yield newState(chanceHandlers[chanceType], {
        input: chanceInput,
        setNextState: (state) => {
            nextState = state;
        },
        turnOrder,
    });

    // check game over
    if (currentPlayer.money < 0) {
        announceBankrupt(currentPlayer, turnOrder);
        onGameOver();
        return endState();
    }

    if (nextState) {
        return nextState;
    }

    return endState();
}

function announceBankrupt(player: GamePlayer, turnOrder: TurnOrder) {
    broadcast(
        turnOrder.getAllPlayers(),
        Packet.forAction(Action.ANNOUNCE_BANKRUPT)
            .setPayload(monopolypb.AnnounceBankruptPayload, {
                player: player.id,
            })
            .build(),
    );
}
