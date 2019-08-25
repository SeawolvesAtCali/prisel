import { Context, Socket } from '../objects';
import { closeSocket } from '../utils/networkUtils';
import { MessageType } from '@prisel/common';
import clientHandlerRegister from '../clientHandlerRegister';
import { getRoom, getClient } from '../utils/stateUtils';

export const handleExit = (context: Context, socket: Socket) => (data: {}) => {
    const { SocketManager, updateState } = context;
    closeSocket(socket);
    if (!SocketManager.hasSocket(socket)) {
        // client has not logged in yet. Nothing to clean up.
        return;
    }
    const room = getRoom(context, socket);
    const client = getClient(context, socket);
    if (room && client) {
        const handle = context.handles[room.id];
        handle.room.onLeave(handle, client.id, data);
    }
    SocketManager.removeBySocket(socket);
    updateState((draft) => {
        delete draft.connections[client.id];
    });
};

clientHandlerRegister.push(MessageType.EXIT, handleExit);
