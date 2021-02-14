import { Action, Anim, animationMap, GamePlayer, toAnimationPacket } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Packet, Request, Response } from '@prisel/server';
import { getPlayer } from '../utils';
import { State } from './stateEnum';
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
    private sync?: Sync;

    public onEnter() {
        this.sync = syncGamePlayer(this.game);
    }

    public onPacket(packet: Packet, gamePlayer: GamePlayer): boolean {
        switch (Packet.getAction(packet)) {
            case Action.GET_INITIAL_STATE:
                if (Request.isRequest(packet)) {
                    const initialStateResponse: monopolypb.GetInitialStateResponse = {
                        players: Array.from(this.game.players.values()).map((player) =>
                            player.getGamePlayerInfo(),
                        ),
                        firstPlayerId: this.game.getCurrentPlayer().id,
                    };
                    getPlayer(gamePlayer).respond(
                        Response.forRequest(packet)
                            .setPayload(monopolypb.GetInitialStateResponse, initialStateResponse)
                            .build(),
                    );
                }
                return true;
            case Action.READY_TO_START_GAME:
                if (this.sync?.has(gamePlayer.id)) {
                    return true;
                }
                const startAndPan = Anim.sequence(
                    Anim.create('game_start').setLength(animationMap.game_start),
                    Anim.create('pan', monopolypb.PanExtra)
                        .setExtra({
                            target: this.game.getCurrentPlayer().pathTile?.get().position,
                        })
                        .setLength(300),
                );
                getPlayer(gamePlayer).emit(toAnimationPacket(startAndPan));
                this.sync?.add(gamePlayer.id);
                if (this.sync?.isSynced()) {
                    Anim.wait(startAndPan, { token: this.token }).then(() => {
                        this.transition({
                            state: State.PRE_ROLL,
                        });
                    });
                }
                return true;
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

    public readonly [Symbol.toStringTag] = 'GameStarted';
}
