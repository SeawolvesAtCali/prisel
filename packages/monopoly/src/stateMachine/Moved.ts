import { StateMachineState } from './StateMachineState';
import { broadcast, PacketType, ResponseWrapper, debug } from '@prisel/server';
import {
    Payment,
    Action,
    PromptPurchasePayload,
    PromptPurchaseResponsePayload,
    PlayerPurchasePayload,
    PlayerPayRentPayload,
    PlayerEndTurnPayload,
    PlayerBankruptPayload,
    PlayerLeftPayload,
    Anim,
    animationMap,
    AnimationPayload,
    toAnimationPacket,
    PropertyTile,
} from '@prisel/monopoly-common';
import { GameOver } from './GameOver';
import { GamePlayer } from '../GamePlayer';
import Property from '../Property';
import { PreRoll } from './PreRoll';
import { chanceList } from '../changeList';
import { getRand } from '../utils';
import { chanceHandlers } from '../chanceHandlers';

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
export class Moved extends StateMachineState {
    public async onEnter() {
        const currentPlayer = this.game.getCurrentPlayer();
        const currentPathNode = currentPlayer.pathNode;

        const { properties } = currentPathNode;

        const handlePayRentPromise = this.handlePayRents(properties, currentPlayer);
        if (handlePayRentPromise) {
            await handlePayRentPromise;
            if (!this.isCurrentState()) {
                return;
            }
        }

        if (this.checkGameOver()) {
            return;
        }

        const investPromise = this.handleInvest(properties, currentPlayer);
        if (investPromise) {
            await investPromise;
            if (!this.isCurrentState()) {
                return;
            }
        }

        // TODO remove these lines after testing chance.
        // const shouldContinue = await this.handleChance();
        // if (!this.isCurrentState()) {
        //     return;
        // }
        // if (!shouldContinue) {
        //     return;
        // }

        broadcast<PlayerEndTurnPayload>(this.game.room.getPlayers(), {
            type: PacketType.DEFAULT,
            action: Action.ANNOUNCE_END_TURN,
            payload: {
                currentPlayerId: currentPlayer.id,
                nextPlayerId: this.game.getNextPlayer().id,
            },
        });
        const currentPlayerPos = this.game.getCurrentPlayer().pathNode.tile.pos;
        const nextPlayerPos = this.game.getNextPlayer().pathNode.tile.pos;

        await Anim.processAndWait(
            this.broadcastAnimation,
            Anim.create('pan', {
                target: nextPlayerPos,
            })
                .setLength(
                    Math.trunc(
                        Math.sqrt(
                            Math.pow(currentPlayerPos.row - nextPlayerPos.row, 2) +
                                Math.pow(currentPlayerPos.col - nextPlayerPos.col, 2),
                        ) * animationMap.pan,
                    ),
                )
                .build(),
        ).promise;
        if (!this.isCurrentState()) {
            return;
        }
        this.game.giveTurnToNext();
        this.transition(PreRoll);
    }

    private checkGameOver() {
        for (const player of this.game.players.values()) {
            if (player.cash < 0) {
                // player bankrupted.
                this.announceBankrupt(player);
                this.transition(GameOver);
                return true;
            }
        }
        return false;
    }

    // return true if should continue current state
    private async handleChance(): Promise<boolean> {
        // randomly select a chance
        const chanceInput = getRand(chanceList);
        const maybeState = await chanceHandlers[chanceInput.type](this.game, chanceInput);
        if (!this.isCurrentState()) {
            return false;
        }
        // check game over
        if (this.checkGameOver()) {
            return false;
        }
        if (maybeState) {
            this.transition(maybeState);
            return false;
        }
        return true;
    }

    private handlePayRents(
        properties: Property[],
        currentPlayer: GamePlayer,
    ): Promise<void> | void {
        const rentPayments: Payment[] = [];

        // check for rent payment first
        for (const property of properties) {
            if (property.owner && property.owner.id !== currentPlayer.id) {
                rentPayments.push(
                    currentPlayer.payRent(property.owner, property.getPropertyInfoForRent()),
                );
            }
        }

        if (rentPayments.length <= 0) {
            return;
        }
        this.announcePayRent(rentPayments);
        return Anim.processAndWait(
            this.broadcastAnimation,
            Anim.create('pay_rent', {
                // TODO: here we assume we are paying one player only
                payer: this.game.getGamePlayerById(rentPayments[0].from).getGamePlayerInfo(),
                receiver: this.game.getGamePlayerById(rentPayments[0].to).getGamePlayerInfo(),
            })
                .setLength(animationMap.pay_rent)
                .build(),
        ).promise;
    }

    private handleInvest(
        properties: Property[],
        currentPlayer: GamePlayer,
    ): Promise<void> | undefined {
        if (!properties.some((property) => property.investable(currentPlayer))) {
            return;
        }
        return this.promptForPurchases(properties);
    }

    private announceBankrupt(player: GamePlayer) {
        broadcast<PlayerBankruptPayload>(this.game.room.getPlayers(), {
            type: PacketType.DEFAULT,
            action: Action.ANNOUNCE_BANKRUPT,
            payload: {
                id: player.id,
            },
        });
    }

    private announcePayRent(payments: Payment[]) {
        broadcast<PlayerPayRentPayload>(this.game.room.getPlayers(), (player) => ({
            type: PacketType.DEFAULT,
            action: Action.ANNOUNCE_PAY_RENT,
            payload: {
                id: this.game.getCurrentPlayer().id,
                payments,
                myCurrentMoney: this.game.getGamePlayer(player).cash,
            },
        }));
    }

    private async promptForPurchases(properties: Property[]) {
        const currentPlayer = this.game.getCurrentPlayer();

        for (const property of properties) {
            if (!property.investable(currentPlayer)) {
                continue;
            }

            const propertyForPurchase = property.getPropertyInfoForInvesting(currentPlayer);
            if (currentPlayer.cash < propertyForPurchase.cost) {
                // not enough money
                continue;
            }

            // TODO it might happen that a player left and force the game to
            // end while we are waiting for current player.
            const response: ResponseWrapper<PromptPurchaseResponsePayload> = await currentPlayer.player.request<
                PromptPurchasePayload
            >(
                {
                    type: PacketType.REQUEST,
                    action: Action.PROMPT_PURCHASE,
                    payload: {
                        property: propertyForPurchase,
                        moneyAfterPurchase: currentPlayer.cash - propertyForPurchase.cost,
                    },
                },
                0, // 0 timeout means no timeout
            );

            if (!this.isCurrentState()) {
                return;
            }
            debug('receive response for purchase' + JSON.stringify(response.get()));
            // although client shouldn't send a error response, let's just
            // check the status as well
            if (!response.ok()) {
                return;
            }

            if (response.payload.purchase) {
                currentPlayer.purchaseProperty(
                    property,
                    property.getPropertyInfoForInvesting(currentPlayer),
                );
                // broadcast purchase
                broadcast<PlayerPurchasePayload>(this.game.room.getPlayers(), {
                    type: PacketType.DEFAULT,
                    action: Action.ANNOUNCE_PURCHASE,
                    payload: {
                        id: currentPlayer.id,
                        property: property.getBasicPropertyInfo(),
                    },
                });

                await Anim.processAndWait(
                    this.broadcastAnimation,
                    Anim.create('invested', { property: property.getBasicPropertyInfo() })
                        .setLength(animationMap.invested)
                        .build(),
                ).promise;
                if (!this.isCurrentState()) {
                    return;
                }
            }
        }
    }

    public onPlayerLeave(gamePlayer: GamePlayer) {
        // player left, let's just end the game
        broadcast<PlayerLeftPayload>(this.game.room.getPlayers(), {
            type: PacketType.DEFAULT,
            action: Action.ANNOUNCE_PLAYER_LEFT,
            payload: {
                player: gamePlayer.getGamePlayerInfo(),
            },
        });
        this.transition(GameOver);
    }

    public get [Symbol.toStringTag]() {
        return 'Moved';
    }
}
