import { Context, Socket } from '../objects';
import { broadcast } from '../utils/networkUtils';
import * as messages from '../message/chat';
import { MessageType } from '@prisel/common';
import clientHandlerRegister from '../clientHandlerRegister';
import { getClient, getRoom } from '../utils/stateUtils';

export const handleChat = (context: Context, client: Socket) => (data: {
    message: string;
}): void => {
    const { message } = data;
    const player = getClient(context, client);
    const room = getRoom(context, client);

    if (player && room) {
        return void broadcast(
            context,
            room.id,
            ...messages.getBroadcastMessage(player.username, message),
        );
    }
};

clientHandlerRegister.push([MessageType.CHAT, handleChat]);
