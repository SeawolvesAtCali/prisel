import { Context, Socket } from './objects';
import { emit, emitToChat } from './networkUtils';
import * as messages from './message/chat';
import * as roomMessages from './message/room';
import RoomType from '../common/message/room';
import ChatType from '../common/message/chat';

export const handleChatConnection = (context: Context) => (client: Socket) => {
    client.on(RoomType.PING, () => {
        emit(client, ...roomMessages.getPong());
    });
    client.on(ChatType.CHAT, (data: { userId: string; message: string }) => {
        const { StateManager, io } = context;
        const { userId, message } = data;
        const { username } = StateManager.connections.controllers[userId];
        emitToChat(io, ...messages.getBroadcastMessage(username, message));
    });
};
