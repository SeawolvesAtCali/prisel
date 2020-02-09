import { GameConfig, debug } from '@prisel/server';
import { createIntialState, flattenState } from './state';
import Game from './Game';
import { Status, PacketType, Request } from '@prisel/common';
import { Action } from './messages';

const MonopolyGameConfig: GameConfig = {
    type: 'monopoly',
    maxPlayers: 4,
    onSetup(room) {},
    canStart(room) {
        return room.getPlayers().length > 1;
    },
    onStart(room) {
        const game = createIntialState(room.getPlayers());
        room.setGame(game);
        debug('The first player is %O', game.turnOrder[0].flat());

        room.listenGamePacket<Request>(Action.DEBUG, (player, packet) => {
            const flatState = flattenState(game);
            player.respond(packet, Status.SUCCESS, flatState);
            debug('current game state is: \n%O', flatState);
        });

        room.listenGamePacket<Request>('roll', (player, packet) => {
            const gamePlayer = game.players.get(player.getId());
            if (game.isCurrentPlayer(gamePlayer)) {
                gamePlayer.roll(game, packet);
            }
        });
        room.listenGamePacket<Request>('purchase', (player, packet) => {
            const gamePlayer = game.players.get(player.getId());
            if (game.isCurrentPlayer(gamePlayer)) {
                gamePlayer.purchase(game, packet);
            }
        });
        room.listenGamePacket<Request>('endturn', (player, packet) => {
            const gamePlayer = game.players.get(player.getId());
            if (game.isCurrentPlayer(gamePlayer)) {
                gamePlayer.endTurn(game, packet);
            }
        });
    },
    onEnd(room) {
        room.removeAllGamePacketListener();
    },
    onRemovePlayer(room, player) {},
};

export default MonopolyGameConfig;
