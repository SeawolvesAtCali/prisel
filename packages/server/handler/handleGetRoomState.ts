import { Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { getRoom, getRoomStateSnapshot } from '../utils/stateUtils';
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
        player.respond(Response.forRequest(request).setFailure('not in a room').build());
        return;
    }
    player.respond(
        Response.forRequest(request)
            .setPayload('getRoomStateResponse', getRoomStateSnapshot(room))
            .build(),
    );
};

clientHandlerRegister.push(priselpb.SystemActionType.GET_ROOM_STATE, handleGetRoomState);
