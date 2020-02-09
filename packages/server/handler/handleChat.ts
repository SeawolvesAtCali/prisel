import { Context, Socket } from '../objects';
import { emit } from '../utils/networkUtils';
import { MessageType, PacketType, ChatPayload, Packet, BroadcastPayload } from '@prisel/common';
import clientHandlerRegister from '../clientHandlerRegister';
import { getPlayer, getRoom } from '../utils/stateUtils';
import { broadcast } from '../utils/broadcast';

// send chat message to everyone in the room including the sender
export const handleChat = (context: Context, client: Socket) => (
    chatPacket: Packet<ChatPayload>,
): void => {
    const { message } = chatPacket.payload;
    const player = getPlayer(context, client);
    const room = getRoom(context, client);

    if (player && room) {
        const packet: Packet<BroadcastPayload> = {
            type: PacketType.DEFAULT,
            systemAction: MessageType.CHAT,
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
