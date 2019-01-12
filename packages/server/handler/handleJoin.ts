import { MessageType } from '@prisel/common';
import { Socket, Context } from '../objects';
import { emit } from '../utils/networkUtils';
import * as messages from '../message/room';
import { getRoom, getClient } from '../utils/stateUtils';
import clientHandlerRegister from '../clientHandlerRegister';

const emitJoinError = (socket: Socket, errorMessage: string) => {
    emit(socket, ...messages.getFailure(MessageType.JOIN, errorMessage));
};

export const handleJoin = (context: Context, socket: Socket) => (data: { roomId: string }) => {
    const currentRoom = getRoom(context, socket);
    const { roomId } = data;
    if (currentRoom && currentRoom.id !== roomId) {
        emitJoinError(socket, `ALREADY IN A ROOM ${currentRoom.id}`);
        return;
    }
    if (!context.StateManager.rooms[roomId]) {
        emitJoinError(socket, 'ROOM DOES NOT EXIST');
        return;
    }
    const client = getClient(context, socket);

    if (client) {
        const handle = context.handles[roomId];
        handle.room.onJoin(handle, client.id, data);
    }
};

clientHandlerRegister.push([MessageType.JOIN, handleJoin]);
