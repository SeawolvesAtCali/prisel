import { Action, Anim, animationMap, GamePlayer } from '@prisel/monopoly-common';
import {
    animation_spec,
    announce_player_left_spec,
    announce_roll_spec,
    announce_start_turn_spec,
    roll_spec,
} from '@prisel/protos';
import { Packet, Request, Response } from '@prisel/server';
import { getPlayer } from '../utils';
import { GameOver } from './GameOver';
import { Moved } from './Moved';
import { StateMachineState } from './StateMachineState';

/**
 * This state is the start of a turn. On client side, camera is focused on the
 * current player and waiting for the player to roll.
 * This state ends when the current player rolls and moves to the destination.
 *
 * On entering this state, server will first broadcast
 * {@link Action.ANNOUNCE_START_TURN} to clients.
 * Then server will broadcast `turn_start` animation to clients. Client should
 * play some animation to denote which is the current player (current player
 * bouncing for example).
 * When the current client sends {@link Action.ROLL} request to server, server
 * will respond immediately to the current client with the dice number and the
 * path client will take. This response is merely used as an acknowledgement of
 * dice roll.
 * Server will also broadcast {@link Action.ANNOUNCE_ROLL} to all clients.
 * Clients should record the dice number and path in the state and use them when
 * animation.
 * Server then broadcasts a series of animation to all clients:
 *
 * dice_roll, dice_down, move
 *
 * When those animation should finish in client side, we transition to Moved state.
 *
 * animation: turn_start, dice_roll, dice_down, move
 */
export class PreRoll extends StateMachineState {
    private rolled = false;

    public onEnter() {
        // start the turn
        this.game.broadcast(
            Packet.forAction(Action.ANNOUNCE_START_TURN)
                .setPayload(announce_start_turn_spec.AnnounceStartTurnPayload, {
                    player: this.game.getCurrentPlayer().id,
                })
                .build(),
        );

        Anim.processAndWait(
            this.broadcastAnimation,
            Anim.create('turn_start', animation_spec.TurnStartExtra)
                .setExtra({
                    player: this.game.getCurrentPlayer().getGamePlayerInfo(),
                })
                .setLength(animationMap.turn_start)
                .build(),
        );
    }

    // override
    public onPacket(packet: Packet, gamePlayer: GamePlayer) {
        switch (Packet.getAction(packet)) {
            case Action.ROLL:
                if (
                    !this.rolled &&
                    Request.isRequest(packet) &&
                    this.game.isCurrentPlayer(gamePlayer)
                ) {
                    const initialPos = gamePlayer.pathTile.get().position;
                    const pathCoordinates = gamePlayer.rollAndMove();
                    this.rolled = true;
                    const steps = pathCoordinates.length;
                    getPlayer(gamePlayer).respond(
                        Response.forRequest(packet)
                            .setPayload(roll_spec.RollResponse, {
                                steps,
                                path: pathCoordinates,
                            })
                            .build(),
                    );

                    // notify other players about current player's move
                    this.game.broadcast((player) => {
                        return Packet.forAction(Action.ANNOUNCE_ROLL)
                            .setPayload(announce_roll_spec.AnnounceRollPayload, {
                                player: gamePlayer.id,
                                steps,
                                path: pathCoordinates,
                                myMoney: player.money,
                            })
                            .build();
                    });
                    Anim.processAndWait(
                        this.broadcastAnimation,
                        Anim.sequence(
                            // turn_start animation should be terminated when dice_roll
                            // is received.
                            Anim.create('dice_roll', animation_spec.DiceRollExtra)
                                .setExtra({
                                    player: gamePlayer.getGamePlayerInfo(),
                                })
                                .setLength(animationMap.dice_roll),
                            Anim.create('dice_down', animation_spec.DiceDownExtra)
                                .setExtra({
                                    steps,
                                    player: gamePlayer.getGamePlayerInfo(),
                                })
                                .setLength(animationMap.dice_down),
                            Anim.create('move', animation_spec.MoveExtra)
                                .setExtra({
                                    player: gamePlayer.getGamePlayerInfo(),
                                    start: initialPos,
                                    path: pathCoordinates,
                                })
                                .setLength(animationMap.move * pathCoordinates.length),
                        ),
                    ).promise.then(() => {
                        if (this.isCurrent()) {
                            this.transition(Moved);
                        }
                    });

                    return true;
                }
        }
        return false;
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
        return 'PreRoll';
    }
}
