import {
    GameConfig,
    debug,
    Request,
    Packet,
    broadcast,
    Room,
    PacketType,
    isSupportedPacket,
} from '@prisel/server';
import { createIntialState, flattenState } from './state';
import { Action, PlayerStartTurnPayload, InitialStatePayload } from '../common/messages';
import Game from './Game';
import { waitForEveryoneSetup, runPlayerTurn } from './gameFlow';

const MonopolyGameConfig: GameConfig = {
    type: 'monopoly',
    maxPlayers: 4,
    canStart(room) {
        return room.getPlayers().length > 1;
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
            await waitForEveryoneSetup(game, room);
            broadcast<InitialStatePayload>(room.getPlayers(), {
                type: PacketType.DEFAULT,
                action: Action.INITIAL_STATE,
                payload: {
                    gamePlayers: Array.from(game.players.values()).map((player) => ({
                        money: player.cash,
                        player: {
                            name: player.player.getName(),
                            id: player.player.getId(),
                        },
                        pos: player.pathNode.tile.pos,
                        character: player.character,
                    })),
                },
            });
            while (true) {
                game.startTurn();
                await runPlayerTurn(game, room);
                debug('game config, player finished turn');
                game.endTurn();

                // check game over
                game.giveTurnToNext();
            }
        })();
    },
    onEnd(room) {
        room.removeAllGamePacketListener();
    },
    onRemovePlayer(room, player) {},
};

export default MonopolyGameConfig;
