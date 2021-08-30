import { Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { buildRoomStateSnapshot, getRoom } from '../utils/stateUtils';
import { getPlayerOrRespondError, verifyIsRequest } from './utils';

export const handleGetRoomState: Handler = (context, socket) => (request) => {
    if (!verifyIsRequest(request)) {
        return;
    }
    const player = getPlayerOrRespondError(context, socket, request);
    if (!player) {
        return;
    }
    const room = getRoom(context, socket);
    if (!room) {
        player.respond(Response.forRequest(request).withFailure('not in a room').build());
        return;
    }
    player.respond(
        Response.forRequest(request)
            .withPayloadBuilder((builder) =>
                priselpb.GetRoomStateResponse.createGetRoomStateResponse(
                    builder,
                    buildRoomStateSnapshot(builder, room),
                ),
            )
            .build(),
    );
};

clientHandlerRegister.push(priselpb.SystemActionType.GET_ROOM_STATE, handleGetRoomState);
