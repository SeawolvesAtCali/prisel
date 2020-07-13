import {
    Action,
    Anim,
    animationMap,
    PlayerLeftPayload,
    PlayerRollPayload,
    PlayerStartTurnPayload,
    RollResponsePayload,
} from '@prisel/monopoly-common';
import { broadcast, isRequest, Packet, PacketType } from '@prisel/server';
import { GamePlayer } from '../gameObjects/GamePlayer';
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
        const startTurnPacket: Packet<PlayerStartTurnPayload> = {
            type: PacketType.DEFAULT,
            action: Action.ANNOUNCE_START_TURN,
            payload: {
                id: this.game.getCurrentPlayer().id,
            },
        };
        broadcast(this.game.room.getPlayers(), startTurnPacket);

        Anim.processAndWait(
            this.broadcastAnimation,
            Anim.create('turn_start', { player: this.game.getCurrentPlayer().getGamePlayerInfo() })
                .setLength(animationMap.turn_start)
                .build(),
        );
    }
    // override
    public onPacket(packet: Packet, gamePlayer: GamePlayer) {
        const action = packet.action;
        switch (action) {
            case Action.ROLL:
                if (!this.rolled && isRequest(packet) && this.game.isCurrentPlayer(gamePlayer)) {
                    const initialPos = gamePlayer.pathNode.position;
                    const pathCoordinates = gamePlayer.rollAndMove();
                    this.rolled = true;
                    const steps = pathCoordinates.length;
                    gamePlayer.player.respond<RollResponsePayload>(packet, {
                        steps,
                        path: pathCoordinates,
                    });

                    // notify other players about current player's move
                    broadcast<PlayerRollPayload>(this.game.room.getPlayers(), (playerInGame) => ({
                        type: PacketType.DEFAULT,
                        action: Action.ANNOUNCE_ROLL,
                        payload: {
                            id: gamePlayer.id,
                            steps,
                            path: pathCoordinates,
                            myMoney: this.game.getGamePlayer(playerInGame).cash,
                        },
                    }));
                    Anim.processAndWait(
                        this.broadcastAnimation,
                        Anim.sequence(
                            // turn_start animation should be terminated when dice_roll
                            // is received.
                            Anim.create('dice_roll', {
                                player: gamePlayer.getGamePlayerInfo(),
                            }).setLength(animationMap.dice_roll),
                            Anim.create('dice_down', {
                                steps,
                                player: gamePlayer.getGamePlayerInfo(),
                            }).setLength(animationMap.dice_down),
                            Anim.create('move', {
                                player: gamePlayer.getGamePlayerInfo(),
                                start: initialPos,
                                path: pathCoordinates,
                            }).setLength(animationMap.move * pathCoordinates.length),
                        ),
                    ).promise.then(() => {
                        if (this.isCurrentState()) {
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
        return 'PreRoll';
    }
}
