import { Packet, Request, Response } from '@prisel/common';
import { error_spec, packet, player_info, system_action_type } from '@prisel/protos';

export function getBroadcast(player: player_info.PlayerInfo, message: string): Packet {
    return Packet.forSystemAction(system_action_type.SystemActionType.BROADCAST)
        .setPayload('broadcastPayload', {
            message,
            player,
        })
        .build();
}

export function getWelcome(): Packet {
    return Packet.forSystemAction(system_action_type.SystemActionType.WELCOME).build();
}

/**
 * Success response for client login
 * @param {String} userId
 */
export function getLoginSuccess(loginRequest: Request, userId: string): Response {
    return Response.forRequest(loginRequest)
        .setPayload('loginResponse', {
            userId,
        })
        .build();
}

export function getError(message: string, detail?: string): packet.Packet {
    const payload: error_spec.ErrorPayload = { message };

    if (detail) {
        payload.detail = detail;
    }
    return Packet.forSystemAction(system_action_type.SystemActionType.ERROR)
        .setPayload('errorPayload', payload)
        .build();
}
