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
import { Action, PlayerStartTurnPayload } from '../common/messages';
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
            while (true) {
                game.startTurn();
                await runPlayerTurn(game, room);
                debug('game config, player finished turn');
                game.endTurn();

                // TODO wait for everyone acknowledge turn end

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
