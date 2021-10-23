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
import { assertExist, Packet, Request, Response } from '@prisel/server';
import { endState, newState, run, StateConfig, useLocalState, useSideEffect } from '@prisel/state';
import { chanceHandlers } from '../chanceHandlers/index';
import { getRand } from '../utils';
import { GameOverState } from './GameOver';
import { PreRollState } from './PreRoll';
import {
    AnimatingAllPlayers,
    getCurrentPlayer,
    getGame,
    getPanAnimationLength,
    provideCurrentPlayer,
    Requesting,
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
export function MovedState() {
    const currentPlayer = getCurrentPlayer();
    const game = getGame();
    const [done, setDone] = useLocalState(false);
    const [gameOver, setGameOver] = useLocalState(false);
    useSideEffect(() => {
        const inspector = run(function* () {
            yield newState(ProcessingPropertyManagement, { onGameOver: () => setGameOver(true) });
            if (gameOver) {
                return newState(GameOverState);
            }
            yield newState(ProcessingChance, { onGameOver: () => setGameOver(true) });
            game.broadcast(
                Packet.forAction(Action.ANNOUNCE_END_TURN)
                    .setPayload(monopolypb.AnnounceEndTurnPayload, {
                        currentPlayer: currentPlayer.id,
                        nextPlayer: game.getNextPlayer().id,
                    })
                    .build(),
            );
            const currentPlayerPos = assertExist(
                game.getCurrentPlayer().pathTile?.get().position,
                'currentPlayerPos',
            );
            const nextPlayerPos = assertExist(
                game.getNextPlayer().pathTile?.get().position,
                'nextPlayerPos',
            );

            yield newState(
                AnimatingAllPlayers,
                Anim.create('pan', monopolypb.PanExtra)
                    .setExtra({
                        target: nextPlayerPos,
                    })
                    .setLength(getPanAnimationLength(currentPlayerPos, nextPlayerPos))
                    .build(),
            );

            game.giveTurnToNext();
            return endState({ onEnd: () => setDone(true) });
        });
        return inspector.exit;
    }, []);

    if (done) {
        return provideCurrentPlayer(game.getCurrentPlayer(), newState(PreRollState));
    }
}

function* ProcessingPropertyManagement(props: { onGameOver: () => void }) {
    const game = getGame();
    const currentPlayer = getCurrentPlayer();
    const { onGameOver } = props;

    const currentPathTile = assertExist(currentPlayer.pathTile?.get(), 'currentPathTile');

    if (currentPathTile.hasProperties.length > 0) {
        const properties = currentPathTile.hasProperties.map((propertyRef) => propertyRef.get());
        const rentPayments: monopolypb.Payment[] = [];
        // check for rent payment first
        for (const property of properties) {
            if (property.owner && property.owner.id !== currentPlayer.id) {
                rentPayments.push(
                    currentPlayer.payRent(property.owner.get(), property.getBasicPropertyInfo()),
                );
            }
        }
        if (rentPayments.length > 0) {
            // announce pay rent
            game.broadcast((player) => {
                return Packet.forAction(Action.ANNOUNCE_PAY_RENT)
                    .setPayload(monopolypb.AnnouncePayRentPayload, {
                        payer: game.getCurrentPlayer().id,
                        payments: rentPayments,
                        myCurrentMoney: player.money || 0,
                    })
                    .build();
            });
            yield newState(
                AnimatingAllPlayers,
                Anim.create('pay_rent', monopolypb.PayRentExtra)
                    .setExtra({
                        // TODO: here we assume we are paying one player only
                        payer: game.getGamePlayerById(rentPayments[0].payer)?.getGamePlayerInfo(),
                        payee: game.getGamePlayerById(rentPayments[0].payee)?.getGamePlayerInfo(),
                    })
                    .setLength(animationMap.pay_rent)
                    .build(),
            );
            if (currentPlayer.money < 0) {
                announceBankrupt(currentPlayer);
                onGameOver();
                return endState();
            }
        }

        if (properties.some((property) => property.investable(currentPlayer))) {
            for (const property of properties) {
                if (!property.investable(currentPlayer)) {
                    continue;
                }

                yield newState(PromptingForPurchase, { property });
            }
        }
    }

    return endState();
}

function* PromptingForPurchase(props: { property: Property }) {
    const game = getGame();
    const currentPlayer = getCurrentPlayer();
    const { property } = props;

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
        game.broadcast(
            Packet.forAction(Action.ANNOUNCE_PURCHASE)
                .setPayload(monopolypb.AnnouncePurchasePayload, {
                    player: currentPlayer.id,
                    property: property.getBasicPropertyInfo(),
                })
                .build(),
        );

        yield newState(
            AnimatingAllPlayers,
            Anim.create('invested', monopolypb.InvestedExtra)
                .setExtra({ property: property.getBasicPropertyInfo() })
                .setLength(animationMap.invested)
                .build(),
        );
    }

    return endState();
}

function* ProcessingChance(props: { onGameOver: () => void }) {
    const currentPlayer = getCurrentPlayer();
    const game = getGame();
    const currentTile = assertExist(currentPlayer.pathTile?.get(), 'currentTile');
    const { onGameOver } = props;

    if (!exist(currentTile.chancePool)) {
        return endState();
    }

    // randomly select a chance
    const chanceInput = getRand(currentTile.chancePool);

    if (!exist(chanceInput)) {
        return endState();
    }
    yield newState(
        AnimatingAllPlayers,
        Anim.create('open_chance_chest', monopolypb.OpenChanceChestExtra)
            .setExtra({
                chanceChestTile: currentTile.position,
                chance: chanceInput.display,
            })
            .setLength(animationMap.open_chance_chest)
            .build(),
    );

    // wait for current player to dismiss the chance card
    yield newState(Requesting, {
        player: currentPlayer,
        request: Request.forAction(Action.PROMPT_CHANCE_CONFIRMATION),
        callback: () => {
            // we don't care about the response.
        },
    });

    yield newState(
        AnimatingAllPlayers,
        Anim.create('dismiss_chance_card').setLength(animationMap.dismiss_chance_card).build(),
    );

    const chanceType = (chanceInput.type as keyof ChanceInputArgs) || 'unspecified';
    let nextState: StateConfig<any> | null = null;
    yield newState(chanceHandlers[chanceType], {
        input: chanceInput,
        setNextState: (state) => {
            nextState = state;
        },
    });

    // check game over
    if (currentPlayer.money < 0) {
        announceBankrupt(currentPlayer);
        onGameOver();
        return endState();
    }

    if (nextState) {
        return nextState;
    }

    return endState();
}

function announceBankrupt(player: GamePlayer) {
    const game = getGame();
    game.broadcast(
        Packet.forAction(Action.ANNOUNCE_BANKRUPT)
            .setPayload(monopolypb.AnnounceBankruptPayload, {
                player: player.id,
            })
            .build(),
    );
}
