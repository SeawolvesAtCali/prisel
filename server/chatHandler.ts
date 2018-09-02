import { Context, Socket } from './objects';
import { emit, emitToChat } from './networkUtils';
import * as messages from './message/chat';
import * as roomMessages from './message/room';

export const handleChatConnection = (context: Context) => (client: Socket) => {
    client.on('PING', () => {
        emit(client, ...roomMessages.getPong());
    });
    client.on('CHAT', (data: { userId: string; message: string }) => {
        const { StateManager, io } = context;
        const { userId, message } = data;
        const { username } = StateManager.connections.controllers[userId];
        emitToChat(io, ...messages.getBroadcastMessage(username, message));
    });
};
