import { Context, Socket } from '../objects';
import { closeSocket } from '../utils/networkUtils';
import { MessageType, Packet } from '@prisel/common';
import clientHandlerRegister from '../clientHandlerRegister';
import { getRoom, getPlayer } from '../utils/stateUtils';

export const handleExit = (context: Context, socket: Socket) => (packet: Packet) => {
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
        context.gameConfig.onRemovePlayer(room, player);
        context.players.delete(player.getId());
    }
    SocketManager.removeBySocket(socket);
};

clientHandlerRegister.push(MessageType.EXIT, handleExit);
