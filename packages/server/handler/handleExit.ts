import { priselpb } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { GAME_PHASE } from '../objects/gamePhase';
import { closeSocket } from '../utils/networkUtils';
import { getPlayer, getRoom } from '../utils/stateUtils';

export const handleExit: Handler = (context, socket) => (_packet) => {
    const { SocketManager } = context;
    closeSocket(socket);
    if (!SocketManager.hasSocket(socket)) {
        // client has not logged in yet. Nothing to clean up.
        return;
    }
    const room = getRoom(context, socket);
    const player = getPlayer(context, socket);
    if (room && player) {
        context.roomConfig.onExit(player);
        if (room.getGamePhase() === GAME_PHASE.GAME) {
            context.gameConfig.onRemovePlayer(room, player);
        }
        context.players.delete(player.getId());
    }
    SocketManager.removeBySocket(socket);
};

clientHandlerRegister.push(priselpb.SystemActionType.EXIT, handleExit);
