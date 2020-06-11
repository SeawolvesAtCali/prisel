import { StateMachineState } from './StateMachineState';
import { broadcast, PacketType, Packet, ResponseWrapper, debug } from '@prisel/server';
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
} from '@prisel/monopoly-common';
import { samePos } from '../utils';
import { PreTurn } from './PreTurn';
import { GameOver } from './GameOver';
import { GamePlayer } from '../GamePlayer';
import Property from '../Property';

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
        this.announcePayRent(rentPayments);

        await this.promptForPurchases(properties);
        if (!this.isCurrentState()) {
            return;
        }

        if (currentPlayer.cash < 0) {
            // player bankrupted.
            this.announceBankrupt(currentPlayer);
            this.machine.transition(GameOver);
            return;
        }
        // player paid rent or purchased property. move on to next state
        // where we wait for every player to finished animation
        broadcast<PlayerEndTurnPayload>(this.game.room.getPlayers(), {
            type: PacketType.DEFAULT,
            action: Action.ANNOUNCE_END_TURN,
            payload: {
                currentPlayerId: currentPlayer.id,
                nextPlayerId: this.game.getNextPlayer().id,
            },
        });
        this.game.giveTurnToNext();
        this.machine.transition(PreTurn);

        // TODO when player doesn't have enough cash, declare bankrupcy
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
        if (payments.length > 0) {
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
    }

    private async promptForPurchases(properties: Property[]) {
        const currentPlayer = this.game.getCurrentPlayer();

        for (const property of properties) {
            if (!property.purchaseable() && !property.upgradable(currentPlayer)) {
                continue;
            }

            const propertyForPurchase = property.getPropertyInfoForPurchaseOrUpgrade(currentPlayer);
            if (currentPlayer.cash < propertyForPurchase.cost) {
                // not enough money
                continue;
            }

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
                    property.getPropertyInfoForPurchaseOrUpgrade(currentPlayer),
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
        this.machine.transition(GameOver);
    }

    public get [Symbol.toStringTag]() {
        return 'Moved';
    }
}
