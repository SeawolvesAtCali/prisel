import { Context, Socket } from '../objects';
import { emit } from '../utils/networkUtils';
import { MessageType } from '@prisel/common';
import * as messages from '../message/room';
import clientHandlerRegister from '../clientHandlerRegister';

import { getRoom, getClient, addRoom } from '../utils/stateUtils';
import Handle from '../utils/handle';

const emitCreateRoomError = (socket: Socket, errorMessage: string) => {
    emit(socket, ...messages.getFailure(MessageType.CREATE_ROOM, errorMessage));
};

export const handleCreateRoom = (context: Context, socket: Socket) => (data: {
    roomName: string;
    gameType?: string;
    roomType?: string;
}) => {
    const { roomName, gameType, roomType } = data;

    const currentRoom = getRoom(context, socket);
    if (currentRoom) {
        // already in a room
        emitCreateRoomError(socket, `ALREADY IN A ROOM ${currentRoom.id}`);
        return;
    }
    const configs = context.getConfigs(gameType, roomType);
    if (!configs) {
        emitCreateRoomError(socket, `CANNOT CREATE A ROOM FOR GAME ${gameType}, ROOM ${roomType}.`);
        return;
    }
    const { gameConfig, roomConfig } = configs;
    const room = addRoom(context, roomName);
    const handle = new Handle({ context, roomId: room.id, gameConfig, roomConfig });
    context.handles[room.id] = handle;
    const hostId = getClient(context, socket).id;
    handle.room.onCreate(handle, hostId, data);
};

clientHandlerRegister.push([MessageType.CREATE_ROOM, handleCreateRoom]);
