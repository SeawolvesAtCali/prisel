import { StateMachineState } from './StateMachineState';
import { Packet, isRequest, broadcast, PacketType } from '@prisel/server';
import {
    Action,
    InitialStatePayload,
    PlayerLeftPayload,
    Anim,
    AnimationPayload,
    toAnimationPacket,
    animationMap,
} from '@prisel/monopoly-common';
import { GamePlayer } from '../GamePlayer';
import { PreRoll } from './PreRoll';
import { GameOver } from './GameOver';
import { Sync, syncGamePlayer } from './utils';

export class GameStarted extends StateMachineState {
    private sync: Sync;
    private gameStartAnimationPromise: Promise<void>;

    public onEnter() {
        this.sync = syncGamePlayer(this.game);
        const gameStartAnimation = Anim.create('game_start')
            .setLength(animationMap.game_start)
            .build();
        broadcast<AnimationPayload>(
            this.game.room.getPlayers(),
            toAnimationPacket(gameStartAnimation),
        );
        this.gameStartAnimationPromise = Anim.wait(gameStartAnimation).promise;
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
                if (!this.sync.isSynced() && this.sync.add(gamePlayer.id)) {
                    (async () => {
                        await this.gameStartAnimationPromise;
                        if (!this.isCurrentState()) {
                            return;
                        }
                        // TODO(minor) calculate the duration based on distance
                        const panToFirstPlayer = Anim.create('pan').setLength(300).build();
                        broadcast<AnimationPayload>(
                            this.game.room.getPlayers(),
                            toAnimationPacket(panToFirstPlayer),
                        );
                        await Anim.wait(panToFirstPlayer).promise;
                        if (!this.isCurrentState()) {
                            return;
                        }
                        this.transition(PreRoll);
                    })();
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
        this.transition(GameOver);
    }

    public get [Symbol.toStringTag]() {
        return 'GameStarted';
    }
}
