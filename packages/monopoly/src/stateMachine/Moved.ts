import { StateMachineState } from './StateMachineState';
import { Encounter, Payment, PropertyInfo } from '../../common/types';
import { toPropertyInfo } from '../Property';
import { broadcast, PacketType, Packet, ResponseWrapper } from '@prisel/server';
import {
    EncounterPayload,
    Action,
    PromptPurchasePayload,
    PromptPurchaseResponsePayload,
    PlayerPurchasePayload,
    PlayerPayRentPayload,
    PlayerEndTurnPayload,
} from '../../common/messages';
import { samePos } from '../utils';
import { PreTurn } from './PreTurn';
import { debug } from '@prisel/server';

export class Moved extends StateMachineState {
    public onEnter() {
        // find encounters on player's spot.
        const currentPlayer = this.game.getCurrentPlayer();
        const currentPathNode = currentPlayer.pathNode;

        const { properties } = currentPathNode;
        const encounters: Encounter[] = [];
        const rentPayments: Payment[] = [];
        const propertiesForPurchase: PropertyInfo[] = [];
        if (properties.length > 0) {
            // check for rent payment first
            for (const property of properties) {
                if (property.owner && property.owner.id !== currentPlayer.id) {
                    rentPayments.push(currentPlayer.payRent(property.owner, property));
                }
                if (!property.owner) {
                    propertiesForPurchase.push(toPropertyInfo(property));
                }
            }
            if (rentPayments.length > 0) {
                encounters.push({
                    payRent: {
                        payments: rentPayments,
                    },
                });
            }
            if (propertiesForPurchase.length > 0) {
                encounters.push({
                    newPropertyForPurchase: {
                        properties: propertiesForPurchase,
                    },
                });
            }
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
        this.promptForPurchases(propertiesForPurchase).then(() => {
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
        });

        // TODO when player doesn't have enough cash, declare bankrupcy
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

    private async promptForPurchases(propertiesForPurchase: PropertyInfo[]) {
        const currentPlayer = this.game.getCurrentPlayer();
        for (const unownedProperty of propertiesForPurchase) {
            if (currentPlayer.cash < unownedProperty.cost) {
                // not enough money
                continue;
            }
            const response: ResponseWrapper<
                PromptPurchaseResponsePayload
            > = await currentPlayer.player.request<PromptPurchasePayload>(
                {
                    type: PacketType.REQUEST,
                    action: Action.PROMPT_PURCHASE,
                    payload: {
                        property: unownedProperty,
                        moneyAfterPurchase: currentPlayer.cash - unownedProperty.cost,
                    },
                },
                0, // 0 timeout means no timeout
            );

            debug('receive response for purchase' + JSON.stringify(response.get()));
            // although client shouldn't send a error response, let's just
            // check the status as well
            if (response.ok()) {
                if (response.payload.purchase) {
                    const propertyToPurchase = currentPlayer.pathNode.properties.find((property) =>
                        samePos(property.pos, unownedProperty.pos),
                    );
                    currentPlayer.purchaseProperty(propertyToPurchase);
                    // broadcast purchase

                    broadcast<PlayerPurchasePayload>(this.game.room.getPlayers(), {
                        type: PacketType.DEFAULT,
                        action: Action.ANNOUNCE_PURCHASE,
                        payload: {
                            id: currentPlayer.id,
                            property: unownedProperty,
                        },
                    });
                }
            }
        }
    }

    public get [Symbol.toStringTag]() {
        return 'Moved';
    }
}
