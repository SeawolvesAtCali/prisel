import { Context, Socket } from '../objects';
import { emit } from '../utils/networkUtils';
import { MessageType, PacketType, ChatPayload, Packet, BroadcastPayload } from '@prisel/common';
import clientHandlerRegister from '../clientHandlerRegister';
import { getPlayer, getRoom } from '../utils/stateUtils';
import { broadcast } from '../utils/broadcast';
import { getPlayerOrRespondError } from './utils';

// send chat message to everyone in the room including the sender
export const handleChat = (context: Context, socket: Socket) => (
    chatPacket: Packet<ChatPayload>,
): void => {
    const player = getPlayerOrRespondError(context, socket, chatPacket);
    if (!player) {
        return;
    }
    const { message } = chatPacket.payload;
    const room = getRoom(context, socket);

    if (player && room) {
        const packet: Packet<BroadcastPayload> = {
            type: PacketType.DEFAULT,
            system_action: MessageType.CHAT,
            payload: {
                from: {
                    userId: player.getId(),
                    username: player.getName(),
                },
                message,
            },
        };
        broadcast(room.getPlayers(), packet);
    }
};

clientHandlerRegister.push(MessageType.CHAT, handleChat);
