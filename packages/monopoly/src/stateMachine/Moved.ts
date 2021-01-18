import {
    Action,
    Anim,
    animationMap,
    ChanceInputArgs,
    exist,
    GamePlayer,
    Property,
} from '@prisel/monopoly-common';
import {
    animation_spec,
    announce_bankrupt_spec,
    announce_end_turn_spec,
    announce_pay_rent_spec,
    announce_player_left_spec,
    announce_purchase_spec,
    payment,
    prompt_purchase_spec,
} from '@prisel/protos';
import { assertExist, Packet, Request } from '@prisel/server';
import { chanceHandlers } from '../chanceHandlers/index';
import { log } from '../log';
import { getPlayer, getRand } from '../utils';
import { GameOver } from './GameOver';
import { PreRoll } from './PreRoll';
import { StateMachineState } from './StateMachineState';

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

        await this.processPropertyManagement();
        if (this.isTransitioned()) {
            return;
        }

        await this.processChance();
        if (this.isTransitioned()) {
            return;
        }

        this.game.broadcast(
            Packet.forAction(Action.ANNOUNCE_END_TURN)
                .setPayload(announce_end_turn_spec.AnnounceEndTurnPayload, {
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

        await Anim.processAndWait(
            this.broadcastAnimation,
            Anim.create('pan', animation_spec.PanExtra)
                .setExtra({
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
        if (!this.isCurrent()) {
            return;
        }
        this.game.giveTurnToNext();
        this.transition(PreRoll);
    }

    private async processPropertyManagement() {
        const currentPlayer = this.game.getCurrentPlayer();
        const currentPathTile = assertExist(currentPlayer.pathTile?.get(), 'currentPathTile');

        if (currentPathTile.hasProperties.length > 0) {
            const properties = currentPathTile.hasProperties.map((propertyRef) =>
                propertyRef.get(),
            );
            const handlePayRentPromise = this.handlePayRents(properties, currentPlayer);
            if (handlePayRentPromise) {
                await handlePayRentPromise;
                if (this.isTransitioned()) {
                    return;
                }
            }

            const investPromise = this.handleInvest(properties, currentPlayer);
            if (investPromise) {
                await investPromise;
                if (this.isTransitioned()) {
                    return;
                }
            }
        }
        this.checkGameOver();
    }

    private checkGameOver() {
        for (const player of this.game.players.values()) {
            if (player.money < 0) {
                // player bankrupted.
                this.announceBankrupt(player);
                this.transition(GameOver);
                return true;
            }
        }
        return false;
    }

    // return true if should continue current state
    private async processChance() {
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
        await Anim.processAndWait(
            this.broadcastAnimation,
            Anim.create('open_chance_chest', animation_spec.OpenChanceChestExtra)
                .setExtra({
                    chanceChestTile: currentTile.position,
                    chance: chanceInput.display,
                })
                .setLength(animationMap.open_chance_chest)
                .build(),
        ).promise;

        if (this.isTransitioned()) {
            return;
        }

        // wait for current player to dismiss the chance card
        await getPlayer(this.game.getCurrentPlayer()).request(
            Request.forAction(Action.PROMPT_CHANCE_CONFIRMATION),
            10000,
        );

        if (this.isTransitioned()) {
            return;
        }

        await Anim.processAndWait(
            this.broadcastAnimation,
            Anim.create('dismiss_chance_card').setLength(animationMap.dismiss_chance_card).build(),
        ).promise;
        if (this.isTransitioned()) {
            return;
        }

        const chanceType = (chanceInput.type as keyof ChanceInputArgs) || 'unspecified';
        const maybeState = await chanceHandlers[chanceType](this.game, chanceInput);

        if (this.isTransitioned()) {
            return;
        }
        // check game over
        if (this.checkGameOver()) {
            return;
        }
        if (maybeState) {
            this.transition(maybeState);
            return;
        }

        return;
    }

    private handlePayRents(
        properties: Property[],
        currentPlayer: GamePlayer,
    ): Promise<void> | void {
        const rentPayments: payment.Payment[] = [];

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
        return Anim.processAndWait(
            this.broadcastAnimation,
            Anim.create('pay_rent', animation_spec.PayRentExtra)
                .setExtra({
                    // TODO: here we assume we are paying one player only
                    payer: this.game.getGamePlayerById(rentPayments[0].payer)?.getGamePlayerInfo(),
                    payee: this.game.getGamePlayerById(rentPayments[0].payee)?.getGamePlayerInfo(),
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
        this.game.broadcast(
            Packet.forAction(Action.ANNOUNCE_BANKRUPT)
                .setPayload(announce_bankrupt_spec.AnnounceBankruptPayload, {
                    player: player.id,
                })
                .build(),
        );
    }

    private announcePayRent(payments: payment.Payment[]) {
        this.game.broadcast((player) => {
            return Packet.forAction(Action.ANNOUNCE_PAY_RENT)
                .setPayload(announce_pay_rent_spec.AnnouncePayRentPayload, {
                    payer: this.game.getCurrentPlayer().id,
                    payments,
                    myCurrentMoney: player.money || 0,
                })
                .build();
        });
    }

    private async promptForPurchases(properties: Property[]) {
        const currentPlayer = this.game.getCurrentPlayer();

        for (const property of properties) {
            if (!property.investable(currentPlayer)) {
                continue;
            }

            const propertyForPurchase = property.getPromptPurchaseRequest(
                currentPlayer,
                currentPlayer.money,
            );
            if (!propertyForPurchase) {
                continue;
            }

            // TODO it might happen that a player left and force the game to
            // end while we are waiting for current player.
            const response = await getPlayer(currentPlayer).request(
                Request.forAction(Action.PROMPT_PURCHASE).setPayload(
                    prompt_purchase_spec.PromptPurchaseRequest,
                    propertyForPurchase,
                ),
                0, // 0 timeout means no timeout
            );

            if (!this.isCurrent()) {
                return;
            }
            log.info('receive response for purchase' + JSON.stringify(response));
            // although client shouldn't send a error response, let's just
            // check the status as well
            if (!Packet.isStatusOk(response)) {
                return;
            }

            if (
                Packet.getPayload(response, prompt_purchase_spec.PromptPurchaseResponse)?.purchased
            ) {
                currentPlayer.purchaseProperty(property, propertyForPurchase);
                // broadcast purchase
                this.game.broadcast(
                    Packet.forAction(Action.ANNOUNCE_PURCHASE)
                        .setPayload(announce_purchase_spec.AnnouncePurchasePayload, {
                            player: currentPlayer.id,
                            property: property.getBasicPropertyInfo(),
                        })
                        .build(),
                );

                await Anim.processAndWait(
                    this.broadcastAnimation,
                    Anim.create('invested', animation_spec.InvestedExtra)
                        .setExtra({ property: property.getBasicPropertyInfo() })
                        .setLength(animationMap.invested)
                        .build(),
                ).promise;
                if (!this.isCurrent()) {
                    return;
                }
            }
        }
    }

    public onPlayerLeave(gamePlayer: GamePlayer) {
        // player left, let's just end the game
        this.game.broadcast(
            Packet.forAction(Action.ANNOUNCE_PLAYER_LEFT)
                .setPayload(announce_player_left_spec.AnnouncePlayerLeftPayload, {
                    player: gamePlayer.getGamePlayerInfo(),
                })
                .build(),
        );
        this.transition(GameOver);
    }

    public get [Symbol.toStringTag]() {
        return 'Moved';
    }
}
