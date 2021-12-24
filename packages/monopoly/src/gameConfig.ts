import { Action, GamePlayer } from '@prisel/monopoly-common';
import { GameConfig, Packet, Player } from '@prisel/server';
import { newEvent, newState, run } from '@prisel/state';
import Game from './Game';
import { log } from './log';
import { createIntialState } from './state';
import { GameStartedState } from './stateMachine/GameStarted';
import {
    PacketEventData,
    provideCurrentPlayer,
    provideGame,
    providePlayerLeftEvent,
    provideReceivedPacketEvent,
} from './stateMachine/utils';
import { pipe } from './utils';

const MonopolyGameConfig: GameConfig = {
    type: 'monopoly',
    maxPlayers: 10,
    canStart(room) {
        // TODO temporarily allow 1 person playing
        return true;
        // return room.getPlayers().length > 1;
    },
    onStart(room) {
        (async () => {
            const playerMap = new WeakMap<Player, GamePlayer>();
            const addPlayerMapping = playerMap.set.bind(playerMap);
            const game = await createIntialState(room, addPlayerMapping, (player: Player) =>
                playerMap.get(player),
            );
            room.setGame(game);
            const [receivedPacket, emitReceivedPacket] = newEvent<PacketEventData>(
                'received-packet',
            );
            const [playerLeft, emitPlayerLeft] = newEvent<GamePlayer>('player-left');
            game.playerLeftEmitter = emitPlayerLeft;
            const inspector = run(
                pipe(
                    newState(GameStartedState),
                    provideGame(game),
                    provideCurrentPlayer(game.getCurrentPlayer()),
                    provideReceivedPacketEvent(receivedPacket),
                    providePlayerLeftEvent(playerLeft),
                ),
            );
            game.inspector = inspector;

            const handleGamePacket = (player: Player, packet: Packet) => {
                const gamePlayer = playerMap.get(player);
                if (!gamePlayer) {
                    log.error(
                        `player with playerId ${player.getId()} doesn't have a corresponding GamePlayer, cannot receive game packet`,
                    );
                    return;
                }
                emitReceivedPacket.send({
                    packet,
                    player: gamePlayer,
                });
            };

            Object.values(Action)
                .filter((action) => action !== Action.UNSPECIFIED && action !== Action.DEBUG) // filter out UNSPECIFIED
                .forEach((action) => room.listenGamePacket(action, handleGamePacket));

            await new Promise<void>((resolve) => {
                inspector.onComplete(resolve);
            });
            room.endGame();
        })();
    },
    onEnd(room) {
        room.removeAllGamePacketListener();
        room.setGame(null);
    },
    onRemovePlayer(room, player) {
        const game = room.getGame<Game>();
        const gamePlayer = game.getGamePlayer(player);
        if (gamePlayer) {
            game.playerLeftEmitter?.send(gamePlayer);
        }
    },
};

export default MonopolyGameConfig;
