import { isNull, Packet } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { debug } from '../debug';
import { broadcast } from '../utils/broadcast';
import { getRoom } from '../utils/stateUtils';
import { getPlayerOrRespondError } from './utils';

// send chat message to everyone in the room including the sender
export const handleChat: Handler = (context, socket) => (chatPacket) => {
    const player = getPlayerOrRespondError(context, socket, chatPacket);
    if (!player) {
        return;
    }
    const payload = Packet.getPayload(chatPacket, priselpb.ChatPayload.getRootAsChatPayload);
    if (isNull(payload)) {
        return;
    }
    const message = payload.message();
    if (isNull(message)) {
        debug('Chat message is null');
        return;
    }
    const room = getRoom(context, socket);

    if (player && room) {
        const packet = Packet.forSystemAction(priselpb.SystemActionType.BROADCAST)
            .withPayloadBuilder((builder) =>
                priselpb.BroadcastPayload.createBroadcastPayload(
                    builder,
                    player.buildPlayerInfo(builder),
                    builder.createString(message),
                ),
            )
            .build();
        broadcast(room.getPlayers(), packet);
    }
};

clientHandlerRegister.push(priselpb.SystemActionType.CHAT, handleChat);
