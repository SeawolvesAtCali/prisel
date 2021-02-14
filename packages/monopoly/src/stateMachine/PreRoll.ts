import { Action, Anim, animationMap, GamePlayer } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Packet, Request, Response } from '@prisel/server';
import { FIXED_STEPS, USE_FIXED_STEPS } from '../defaultFlags';
import { flags } from '../flags';
import { getPlayer } from '../utils';
import { MovingExtra } from './extra';
import { State } from './stateEnum';
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

    public async onEnter() {
        // start the turn
        this.game.broadcast(
            Packet.forAction(Action.ANNOUNCE_START_TURN)
                .setPayload(monopolypb.AnnounceStartTurnPayload, {
                    player: this.game.getCurrentPlayer().id,
                })
                .build(),
        );

        await Anim.wait(
            Anim.create('turn_start', monopolypb.TurnStartExtra)
                .setExtra({
                    player: this.game.getCurrentPlayer().getGamePlayerInfo(),
                })
                .setLength(animationMap.turn_start)
                .build(),
            { onStart: this.broadcastAnimation },
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
                    const steps = flags.get(USE_FIXED_STEPS)
                        ? flags.get(FIXED_STEPS)
                        : gamePlayer.getDiceRoll();

                    getPlayer(gamePlayer).respond(
                        Response.forRequest(packet)
                            .setPayload(monopolypb.RollResponse, {
                                steps,
                            })
                            .build(),
                    );
                    this.game.broadcast((player) => {
                        return Packet.forAction(Action.ANNOUNCE_ROLL)
                            .setPayload(monopolypb.AnnounceRollPayload, {
                                player: gamePlayer.id,
                                steps,
                                currentPosition: gamePlayer.pathTile?.get().position,
                                myMoney: player.money,
                            })
                            .build();
                    });
                    Anim.wait(
                        Anim.sequence(
                            // turn_start animation should be terminated when dice_roll
                            // is received.
                            Anim.create('dice_roll', monopolypb.DiceRollExtra)
                                .setExtra({
                                    player: gamePlayer.getGamePlayerInfo(),
                                })
                                .setLength(animationMap.dice_roll),
                            Anim.create('dice_down', monopolypb.DiceDownExtra)
                                .setExtra({
                                    steps,
                                    player: gamePlayer.getGamePlayerInfo(),
                                })
                                .setLength(animationMap.dice_down),
                        ),
                        { onStart: this.broadcastAnimation },
                    ).then(() => {
                        if (!this.token.cancelled) {
                            this.transition<MovingExtra>({
                                state: State.MOVING,
                                extra: {
                                    type: 'usingSteps',
                                    steps,
                                },
                            });
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
                .setPayload(monopolypb.AnnouncePlayerLeftPayload, {
                    player: gamePlayer.getGamePlayerInfo(),
                })
                .build(),
        );
        this.transition({ state: State.GAME_OVER });
    }
    public readonly [Symbol.toStringTag] = 'PreRoll';
}
