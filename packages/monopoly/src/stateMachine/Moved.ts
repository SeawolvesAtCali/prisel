import { StateMachineState } from './StateMachineState';
import { broadcast, PacketType, ResponseWrapper, debug } from '@prisel/server';
import {
    Encounter,
    Payment,
    EncounterPayload,
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
} from '@prisel/monopoly-common';
import { GameOver } from './GameOver';
import { GamePlayer } from '../GamePlayer';
import Property from '../Property';
import { PreRoll } from './PreRoll';

export class Moved extends StateMachineState {
    public async onEnter() {
        // find encounters on player's spot.
        const currentPlayer = this.game.getCurrentPlayer();
        const currentPathNode = currentPlayer.pathNode;

        const { properties } = currentPathNode;
        const encounters: Encounter[] = [];
        const rentPayments: Payment[] = [];

        // check for rent payment first
        for (const property of properties) {
            if (property.owner && property.owner.id !== currentPlayer.id) {
                rentPayments.push(
                    currentPlayer.payRent(property.owner, property.getPropertyInfoForRent()),
                );
            }
        }
        if (rentPayments.length > 0) {
            encounters.push({
                payRent: {
                    payments: rentPayments,
                },
            });
        }

        if (encounters.length > 0) {
            broadcast<EncounterPayload>(this.game.room.getPlayers(), (playerInGame) => ({
                type: PacketType.DEFAULT,
                action: Action.ENCOUNTER,
                payload: {
                    playerId: currentPlayer.id,
                    encounters,
                    myMoney: this.game.getGamePlayer(playerInGame).cash,
                },
            }));
        }

        if (rentPayments.length > 0) {
            this.announcePayRent(rentPayments);
            const payRentAnimation = Anim.create('pay_rent')
                .setLength(animationMap.pay_rent)
                .build();
            broadcast<AnimationPayload>(
                this.game.room.getPlayers(),
                toAnimationPacket(payRentAnimation),
            );
            await Anim.wait(payRentAnimation).promise;
            if (!this.isCurrentState()) {
                return;
            }
        }

        if (properties.some((property) => property.investable(currentPlayer))) {
            await this.promptForPurchases(properties);
            if (!this.isCurrentState()) {
                return;
            }
        }

        if (currentPlayer.cash < 0) {
            // player bankrupted.
            this.announceBankrupt(currentPlayer);
            this.transition(GameOver);
            return;
        }

        const currentPlayerPos = this.game.getCurrentPlayer().pathNode.tile.pos;
        const nextPlayerPos = this.game.getNextPlayer().pathNode.tile.pos;
        const panningToNextPlayer = Anim.create('pan')
            .setLength(
                Math.trunc(
                    Math.sqrt(
                        Math.pow(currentPlayerPos.row - nextPlayerPos.row, 2) +
                            Math.pow(currentPlayerPos.col - nextPlayerPos.col, 2),
                    ) * animationMap.pan,
                ),
            )
            .build();
        broadcast<AnimationPayload>(
            this.game.room.getPlayers(),
            toAnimationPacket(panningToNextPlayer),
        );
        await Anim.wait(panningToNextPlayer).promise;
        if (!this.isCurrentState()) {
            return;
        }
        broadcast<PlayerEndTurnPayload>(this.game.room.getPlayers(), {
            type: PacketType.DEFAULT,
            action: Action.ANNOUNCE_END_TURN,
            payload: {
                currentPlayerId: currentPlayer.id,
                nextPlayerId: this.game.getNextPlayer().id,
            },
        });
        this.game.giveTurnToNext();
        this.transition(PreRoll);
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
                const investedAnimation = Anim.create('invested')
                    .setLength(animationMap.invested)
                    .build();
                broadcast<AnimationPayload>(
                    this.game.room.getPlayers(),
                    toAnimationPacket(investedAnimation),
                );
                await Anim.wait(investedAnimation).promise;
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
