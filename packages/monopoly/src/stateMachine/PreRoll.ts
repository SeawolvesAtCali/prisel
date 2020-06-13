import {
    Action,
    PlayerRollPayload,
    RollResponsePayload,
    PlayerStartTurnPayload,
    PlayerLeftPayload,
    Anim,
    toAnimationPacket,
    animationMap,
    AnimationPayload,
} from '@prisel/monopoly-common';
import { Packet, isRequest, broadcast, PacketType } from '@prisel/server';
import { GamePlayer } from '../GamePlayer';
import { StateMachineState } from './StateMachineState';
import { Moved } from './Moved';
import { GameOver } from './GameOver';

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

        const turnStartAnim = Anim.create('turn_start').setLength(animationMap.turn_start).build();
        broadcast(this.game.room.getPlayers(), toAnimationPacket(turnStartAnim));
        Anim.wait(turnStartAnim).promise.then(() => {
            if (this.isCurrentState()) {
                broadcast(this.game.room.getPlayers(), startTurnPacket);
            }
        });
    }
    // override
    public onPacket(packet: Packet, gamePlayer: GamePlayer) {
        const action = packet.action;
        switch (action) {
            case Action.ROLL:
                if (!this.rolled && isRequest(packet) && this.game.isCurrentPlayer(gamePlayer)) {
                    const pathCoordinates = gamePlayer.rollAndMove();
                    this.rolled = true;
                    gamePlayer.player.respond<RollResponsePayload>(packet, {
                        steps: pathCoordinates.length,
                        path: pathCoordinates,
                    });

                    // notify other players about current player's move
                    broadcast<PlayerRollPayload>(this.game.room.getPlayers(), (playerInGame) => ({
                        type: PacketType.DEFAULT,
                        action: Action.ANNOUNCE_ROLL,
                        payload: {
                            id: gamePlayer.id,
                            steps: pathCoordinates.length,
                            path: pathCoordinates,
                            myMoney: this.game.getGamePlayer(playerInGame).cash,
                        },
                    }));
                    const rollAnim = Anim.sequence(
                        Anim.create('dice_roll').setLength(animationMap.dice_roll),
                        Anim.create('dice_down').setLength(animationMap.dice_down),
                        Anim.create('move').setLength(animationMap.move * pathCoordinates.length),
                    );

                    broadcast<AnimationPayload>(
                        this.game.room.getPlayers(),
                        toAnimationPacket(rollAnim),
                    );
                    Anim.wait(rollAnim).promise.then(() => {
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
