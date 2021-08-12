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
import { assertExist, Packet, Request, Token } from '@prisel/server';
import { chanceHandlers } from '../chanceHandlers/index';
import { log } from '../log';
import { getPlayer, getRand } from '../utils';
import { State } from './stateEnum';
import { StateMachineState } from './StateMachineState';
import { getPanAnimationLength } from './utils';

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

        await this.startCoroutine(this.processPropertyManagement());
        await this.startCoroutine(this.processChance());
        if (this.token.cancelled) {
            return;
        }

        this.game.broadcast(
            Packet.forAction(Action.ANNOUNCE_END_TURN)
                .setPayload(monopolypb.AnnounceEndTurnPayload, {
                    currentPlayer: currentPlayer.id,
                    nextPlayer: this.game.getNextPlayer().id,
                })
                .build(),
        );

        const currentPlayerPos = assertExist(
            this.game.getCurrentPlayer().pathTile?.get().position,
            'currentPlayerPos',
        );
        const nextPlayerPos = assertExist(
            this.game.getNextPlayer().pathTile?.get().position,
            'nextPlayerPos',
        );

        await Anim.wait(
            Anim.create('pan', monopolypb.PanExtra)
                .setExtra({
                    target: nextPlayerPos,
                })
                .setLength(getPanAnimationLength(currentPlayerPos, nextPlayerPos))
                .build(),
            { onStart: this.broadcastAnimation },
        );
        if (this.token.cancelled) {
            return;
        }
        this.game.giveTurnToNext();
        this.transition({ state: State.PRE_ROLL });
    }

    private *processPropertyManagement() {
        const currentPlayer = this.game.getCurrentPlayer();
        const currentPathTile = assertExist(currentPlayer.pathTile?.get(), 'currentPathTile');

        if (currentPathTile.hasProperties.length > 0) {
            const properties = currentPathTile.hasProperties.map((propertyRef) =>
                propertyRef.get(),
            );
            yield* this.handlePayRents(properties, currentPlayer);
            yield* this.handleInvest(properties, currentPlayer);
        }
        this.checkGameOver();
    }

    private checkGameOver() {
        for (const player of this.game.players.values()) {
            if (player.money < 0) {
                // player bankrupted.
                this.announceBankrupt(player);
                this.transition({ state: State.GAME_OVER });
                return true;
            }
        }
        return false;
    }

    // return true if should continue current state
    private *processChance(): Generator<Promise<any>, any, any> {
        const currentPlayer = this.game.getCurrentPlayer();
        const currentTile = assertExist(currentPlayer.pathTile?.get(), 'currentTile');

        if (!exist(currentTile.chancePool)) {
            return;
        }

        // randomly select a chance
        const chanceInput = getRand(currentTile.chancePool);

        if (!exist(chanceInput)) {
            return;
        }
        yield Anim.wait(
            Anim.create('open_chance_chest', monopolypb.OpenChanceChestExtra)
                .setExtra({
                    chanceChestTile: currentTile.position,
                    chance: chanceInput.display,
                })
                .setLength(animationMap.open_chance_chest)
                .build(),
            { onStart: this.broadcastAnimation, token: this.token },
        );

        // wait for current player to dismiss the chance card
        yield getPlayer(this.game.getCurrentPlayer()).request(
            Request.forAction(Action.PROMPT_CHANCE_CONFIRMATION),
            Token.delay(10000),
        );

        yield Anim.wait(
            Anim.create('dismiss_chance_card').setLength(animationMap.dismiss_chance_card).build(),
            { onStart: this.broadcastAnimation },
        );

        const chanceType = (chanceInput.type as keyof ChanceInputArgs) || 'unspecified';
        const maybeTransition = yield chanceHandlers[chanceType](this.game, chanceInput);

        // check game over
        if (this.checkGameOver()) {
            return;
        }
        if (maybeTransition) {
            this.transition(maybeTransition);
            return;
        }

        return;
    }

    private *handlePayRents(properties: Property[], currentPlayer: GamePlayer) {
        const rentPayments: monopolypb.Payment[] = [];

        // check for rent payment first
        for (const property of properties) {
            if (property.owner && property.owner.id !== currentPlayer.id) {
                rentPayments.push(
                    currentPlayer.payRent(property.owner.get(), property.getBasicPropertyInfo()),
                );
            }
        }

        if (!exist(rentPayments[0])) {
            return;
        }
        this.announcePayRent(rentPayments);
        yield Anim.wait(
            Anim.create('pay_rent', monopolypb.PayRentExtra)
                .setExtra({
                    // TODO: here we assume we are paying one player only
                    payer: this.game.getGamePlayerById(rentPayments[0].payer)?.getGamePlayerInfo(),
                    payee: this.game.getGamePlayerById(rentPayments[0].payee)?.getGamePlayerInfo(),
                })
                .setLength(animationMap.pay_rent)
                .build(),
            { token: this.token, onStart: this.broadcastAnimation },
        );
    }

    private *handleInvest(properties: Property[], currentPlayer: GamePlayer) {
        if (!properties.some((property) => property.investable(currentPlayer))) {
            return;
        }
        yield* this.promptForPurchases(properties);
    }

    private announceBankrupt(player: GamePlayer) {
        this.game.broadcast(
            Packet.forAction(Action.ANNOUNCE_BANKRUPT)
                .setPayload(monopolypb.AnnounceBankruptPayload, {
                    player: player.id,
                })
                .build(),
        );
    }

    private announcePayRent(payments: monopolypb.Payment[]) {
        this.game.broadcast((player) => {
            return Packet.forAction(Action.ANNOUNCE_PAY_RENT)
                .setPayload(monopolypb.AnnouncePayRentPayload, {
                    payer: this.game.getCurrentPlayer().id,
                    payments,
                    myCurrentMoney: player.money || 0,
                })
                .build();
        });
    }

    private *promptForPurchases(properties: Property[]): Generator<Promise<any>, any, any> {
        const currentPlayer = this.game.getCurrentPlayer();

        for (const property of properties) {
            if (!property.investable(currentPlayer)) {
                continue;
            }

            const propertyForPurchase = property.getPromptPurchaseRequest(
                currentPlayer,
                currentPlayer.money,
            );
            console.log('prompt for purchase is ' + JSON.stringify(propertyForPurchase, null, 2));
            if (!propertyForPurchase) {
                continue;
            }

            // TODO it might happen that a player left and force the game to
            // end while we are waiting for current player.
            const response = yield getPlayer(currentPlayer).request(
                Request.forAction(Action.PROMPT_PURCHASE).setPayload(
                    monopolypb.PromptPurchaseRequest,
                    propertyForPurchase,
                ),
                this.token, // no timeout
            );

            log.info('receive response for purchase' + JSON.stringify(response));
            if (!Packet.isStatusOk(response)) {
                return;
            }

            if (Packet.getPayload(response, monopolypb.PromptPurchaseResponse)?.purchased) {
                currentPlayer.purchaseProperty(property, propertyForPurchase);
                // broadcast purchase
                this.game.broadcast(
                    Packet.forAction(Action.ANNOUNCE_PURCHASE)
                        .setPayload(monopolypb.AnnouncePurchasePayload, {
                            player: currentPlayer.id,
                            property: property.getBasicPropertyInfo(),
                        })
                        .build(),
                );

                yield Anim.wait(
                    Anim.create('invested', monopolypb.InvestedExtra)
                        .setExtra({ property: property.getBasicPropertyInfo() })
                        .setLength(animationMap.invested)
                        .build(),
                    { token: this.token, onStart: this.broadcastAnimation },
                );
            }
        }
    }

    public onPlayerLeave(gamePlayer: GamePlayer) {
        // player left, let's just end the game
        this.game.broadcast(
            Packet.forAction(Action.ANNOUNCE_PLAYER_LEFT)
                .setPayload(monopolypb.AnnouncePlayerLeftPayload, {
                    player: gamePlayer.getGamePlayerInfo(),
                })
                .build(),
        );
        this.transition({ state: State.GAME_OVER });
    }

    public readonly [Symbol.toStringTag] = 'Moved';
}
