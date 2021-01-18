import { Packet, Request, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';

export function getBroadcast(player: priselpb.PlayerInfo, message: string): Packet {
    return Packet.forSystemAction(priselpb.SystemActionType.BROADCAST)
        .setPayload('broadcastPayload', {
            message,
            player,
        })
        .build();
}

export function getWelcome(): Packet {
    return Packet.forSystemAction(priselpb.SystemActionType.WELCOME).build();
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

export function getError(message: string, detail?: string): priselpb.Packet {
    const payload: priselpb.ErrorPayload = { message };

    if (detail) {
        payload.detail = detail;
    }
    return Packet.forSystemAction(priselpb.SystemActionType.ERROR)
        .setPayload('errorPayload', payload)
        .build();
}
