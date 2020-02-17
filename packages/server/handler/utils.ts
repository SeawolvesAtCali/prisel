import { getPlayer } from '../utils/stateUtils';
import { Context } from '../objects';
import WebSocket from 'ws';
import { Packet, isRequest, PacketType, MessageType, ErrorPayload } from '@prisel/common';
import { getFailureFor } from '../message';
import { emit } from '../utils/networkUtils';

export function getPlayerOrRespondError(context: Context, socket: WebSocket, packet: Packet) {
    const player = getPlayer(context, socket);
    if (!player) {
        if (isRequest(packet)) {
            emit(socket, getFailureFor(packet, 'Please login first'));
        } else {
            emit<Packet<ErrorPayload>>(socket, {
                type: PacketType.DEFAULT,
                system_action: MessageType.ERROR,
                payload: {
                    message: 'Unauthenticated',
                },
            });
        }
        return;
    }
    return player;
}
