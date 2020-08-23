import {
    Action,
    Anim,
    animationMap,
    InitialStatePayload,
    PlayerLeftPayload,
    toAnimationPacket,
} from '@prisel/monopoly-common';
import { broadcast, isRequest, Packet, PacketType } from '@prisel/server';
import { GamePlayer } from '../gameObjects/GamePlayer';
import { GameOver } from './GameOver';
import { PreRoll } from './PreRoll';
import { StateMachineState } from './StateMachineState';
import { Sync, syncGamePlayer } from './utils';

/**
 * When game starts, each client should request GET_INITIAL_STATE. This is how
 * server knows that a client is on game scene and ready to receive game
 * packages.
 * Server send initial state to client upon GET_INITIAL_STATE. When client
 * finishes instantiating all the game objects (including loading maps), client
 * should send back READY_TO_START_GAME.
 * Server then sends animation to client, this includes showing "START!" as well
 * as panning to the first player, upon READ_TO_START_GAME.
 * When all clients send back READY_TO_START_GAME, and the animation for the
 * last player(the last one that send back READY_TO_START_GAME) *should* finish,
 * we go to the next state PreRoll.
 *
 * Usually we don't want to wait(sync) for all clients as we should allow client
 * to temporarily disconnect (for example, switching tab). But this is the start
 * of the game, so it would be good to catch any inactive player. Also we are
 * not able to respond to GET_INITIAL_STATE after this state.
 *
 * animations: game_start, pan
 */
export class GameStarted extends StateMachineState {
    private sync: Sync;

    public onEnter() {
        this.sync = syncGamePlayer(this.game);
    }

    public onPacket(packet: Packet, gamePlayer: GamePlayer): boolean {
        switch (packet.action) {
            case Action.GET_INITIAL_STATE:
                if (isRequest(packet)) {
                    gamePlayer.player.respond<InitialStatePayload>(packet, {
                        gamePlayers: Array.from(this.game.players.values()).map((player) =>
                            player.getGamePlayerInfo(),
                        ),
                        firstPlayerId: this.game.getCurrentPlayer().id,
                    });
                }
                return true;
            case Action.READY_TO_START_GAME:
                (async () => {
                    if (!this.sync.has(gamePlayer.id)) {
                        const startAndPan = Anim.sequence(
                            Anim.create('game_start').setLength(animationMap.game_start),
                            Anim.create('pan', {
                                target: this.game.getCurrentPlayer().pathTile.position,
                            }).setLength(300),
                        );
                        gamePlayer.player.emit(toAnimationPacket(startAndPan));
                        this.sync.add(gamePlayer.id);
                        if (this.sync.isSynced()) {
                            await Anim.wait(startAndPan).promise;
                            if (!this.isCurrentState()) {
                                return;
                            }
                            this.transition(PreRoll);
                        }
                    }
                })();
                return true;
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
        return 'GameStarted';
    }
}
