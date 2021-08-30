import { Packet, PacketView, Request, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import { Player } from './player';

declare global {
    namespace jest {
        interface Matchers<R> {
            responseHavingId(id: string): CustomMatcherResult;
        }
    }
}
export function getBroadcast(player: Player, message: string): PacketView {
    return Packet.forSystemAction(priselpb.SystemActionType.BROADCAST)
        .withPayloadBuilder((builder) =>
            priselpb.BroadcastPayload.createBroadcastPayload(
                builder,
                player.buildPlayerInfo(builder),
                builder.createString(message),
            ),
        )
        .build();
}

export function getWelcome(): PacketView {
    return Packet.forSystemAction(priselpb.SystemActionType.WELCOME).build();
}

/**
 * Success response for client login
 * @param {String} userId
 */
export function getLoginSuccess(loginRequest: Request, userId: string): PacketView<Response> {
    return Response.forRequest(loginRequest)
        .withPayloadBuilder((builder) =>
            priselpb.LoginResponse.createLoginResponse(builder, builder.createString(userId)),
        )
        .build();
}

export function buildError(message: string, detail: string = ''): PacketView {
    const packetBuilder = Packet.forSystemAction(
        priselpb.SystemActionType.ERROR,
    ).withPayloadBuilder((builder) =>
        priselpb.ErrorPayload.createErrorPayload(
            builder,
            builder.createString(message),
            builder.createString(detail),
        ),
    );

    return packetBuilder.build();
}
