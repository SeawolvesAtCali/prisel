import { Context, Socket } from '../objects';
import clientHandlerRegister from '../clientHandlerRegister';
import { getPlayerOrRespondError } from './utils';
import { Request, MessageType, RoomStateResponsePayload } from '@prisel/common';
import { getRoom, getRoomStateSnapshot } from '../utils/stateUtils';

export const handleGetRoomState = (context: Context, socket: Socket) => (request: Request) => {
    const player = getPlayerOrRespondError(context, socket, request);
    if (!player) {
        return;
    }
    const room = getRoom(context, socket);
    if (!room) {
        player.respondFailure(request, 'not in a room');
        return;
    }
    player.respond<RoomStateResponsePayload>(request, getRoomStateSnapshot(room));
};

clientHandlerRegister.push(MessageType.GET_ROOM_STATE, handleGetRoomState);
