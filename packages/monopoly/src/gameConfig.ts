import { GameConfig, debug, Request, Packet, Player } from '@prisel/server';
import { createIntialState, flattenState } from './state';
import { Action } from '../common/messages';
import { StateMachine } from './stateMachine/StateMachine';
import { GameStarted } from './stateMachine/GameStarted';

const MonopolyGameConfig: GameConfig = {
    type: 'monopoly',
    maxPlayers: 4,
    canStart(room) {
        // TODO temporarily allow 1 person playing
        return true;
        // return room.getPlayers().length > 1;
    },
    onStart(room) {
        (async () => {
            const game = await createIntialState(room);
            room.setGame(game);
            room.listenGamePacket<Request>(Action.DEBUG, (player, packet) => {
                const flatState = flattenState(game);
                player.respond(packet, flatState);
                debug('current game state is: \n%O', flatState);
            });
            const stateMachine = new StateMachine(game);

            const handleGamePacket = (player: Player, packet: Packet) => {
                if (!stateMachine.state.onPacket(packet, game.getGamePlayer(player))) {
                    debug(
                        `packet ${packet.action} is not processed by state ${
                            stateMachine.state[Symbol.toStringTag]
                        }`,
                    );
                }
            };

            Object.values(Action)
                .filter((action) => action !== Action.UNSPECIFIED && action !== Action.DEBUG) // filter out UNSPECIFIED
                .forEach((action) => room.listenGamePacket(action, handleGamePacket));

            stateMachine.init(GameStarted);
            await new Promise((resolve) => {
                stateMachine.setOnEnd(resolve);
            });
            room.endGame();
        })();
    },
    onEnd(room) {
        room.removeAllGamePacketListener();
        room.setGame(null);
    },
    onRemovePlayer(room, player) {},
};

export default MonopolyGameConfig;
