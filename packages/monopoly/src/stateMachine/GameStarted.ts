import { StateMachineState } from './StateMachineState';
import { Packet, isRequest, isPacket, broadcast, PacketType } from '@prisel/server';
import { Action, InitialStatePayload, PlayerLeftPayload } from '../../common/messages';
import { GamePlayer } from '../GamePlayer';
import { PreRoll } from './PreRoll';
import { GameOver } from './GameOver';
import { Sync, syncGamePlayer } from './utils';

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
            case Action.READY_TO_START_TURN:
                if (this.sync.add(gamePlayer.id)) {
                    this.machine.transition(PreRoll);
                }
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
        this.machine.transition(GameOver);
    }

    public get [Symbol.toStringTag]() {
        return 'GameStarted';
    }
}
