import WebSocket from 'ws';
import { Context, Socket } from '../objects';
import { broadcast } from '../networkUtils';
import * as messages from '../message/chat';
import ChatType from '@monopoly/common/lib/message/chat';
import clientHandlerRegister from '../clientHandlerRegister';

export const handleChat = (context: Context, client: Socket) => (data: {
    userId: string;
    message: string;
    roomId: string;
}): void => {
    const { StateManager } = context;
    const { userId, message, roomId } = data;
    const { username } = StateManager.connections[userId];

    if (roomId) {
        return void broadcast(
            context,
            roomId,
            ...messages.getBroadcastMessage(username, message, roomId),
        );
    }
};

clientHandlerRegister.push([ChatType.CHAT, handleChat]);
