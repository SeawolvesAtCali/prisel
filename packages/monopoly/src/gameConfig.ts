import { Action, exist, GamePlayer } from '@prisel/monopoly-common';
import { GameConfig, Packet, Player } from '@prisel/server';
import Game from './Game';
import { log } from './log';
import { createIntialState } from './state';
import { State } from './stateMachine/stateEnum';
import { StateMachine } from './stateMachine/StateMachine';

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
            const stateMachine = new StateMachine(game);

            const handleGamePacket = (player: Player, packet: Packet) => {
                const gamePlayer = playerMap.get(player);
                if (!gamePlayer) {
                    log.error(
                        `player with playerId ${player.getId()} doesn't have a corresponding GamePlayer, cannot receive game packet`,
                    );
                    return;
                }
                if (!stateMachine.state?.onPacket(packet, gamePlayer)) {
                    log.warn(
                        `packet ${Packet.getAction(packet)} is not processed by state ${
                            stateMachine.state?.[Symbol.toStringTag]
                        }`,
                    );
                }
            };

            Object.values(Action)
                .filter((action) => action !== Action.UNSPECIFIED && action !== Action.DEBUG) // filter out UNSPECIFIED
                .forEach((action) => room.listenGamePacket(action, handleGamePacket));

            stateMachine.init(State.GAME_STARTED);
            await new Promise<void>((resolve) => {
                stateMachine.setOnEnd(resolve);
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
        if (exist(game?.stateMachine) && exist(gamePlayer)) {
            game.stateMachine.state?.onPlayerLeave(gamePlayer);
        }
    },
};

export default MonopolyGameConfig;
