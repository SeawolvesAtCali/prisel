import { Packet } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { broadcast } from '../utils/broadcast';
import { getPlayerInfo, getRoom } from '../utils/stateUtils';
import { getPlayerOrRespondError } from './utils';

// send chat message to everyone in the room including the sender
export const handleChat: Handler = (context, socket) => (chatPacket) => {
    const player = getPlayerOrRespondError(context, socket, chatPacket);
    if (!player) {
        return;
    }
    const payload = Packet.getPayload(chatPacket, 'chatPayload');
    if (!payload) {
        return;
    }
    const { message } = payload;
    const room = getRoom(context, socket);

    if (player && room) {
        const packet = Packet.forSystemAction(priselpb.SystemActionType.BROADCAST)
            .setPayload('broadcastPayload', {
                player: getPlayerInfo(player),
                message,
            })
            .build();

        broadcast(room.getPlayers(), packet);
    }
};

clientHandlerRegister.push(priselpb.SystemActionType.CHAT, handleChat);
