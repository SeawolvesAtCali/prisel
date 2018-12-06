import { Context, Socket } from '../objects';
import { broadcastInRoom, emit } from '../networkUtils';
import * as messages from '../message/chat';
import ChatType from '../../common/message/chat';
import clientHandlerRegister from '../clientHandlerRegister';

export const handleChat = (context: Context, client: Socket) => (data: {
    userId: string;
    message: string;
    roomId: string;
}): void => {
    const { StateManager, io } = context;
    const { userId, message, roomId } = data;
    const { username } = StateManager.connections.controllers[userId];

    if (roomId) {
        return void broadcastInRoom(
            io,
            roomId,
            ...messages.getBroadcastMessage(username, message, roomId),
        );
    }
    return void emit(io.sockets, ...messages.getBroadcastMessage(username, message, null));
};

clientHandlerRegister.push([ChatType.CHAT, handleChat]);
