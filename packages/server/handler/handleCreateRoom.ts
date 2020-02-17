import { Context, Socket } from '../objects';
import { MessageType, Request, CreateRoomPayload } from '@prisel/common';
import clientHandlerRegister from '../clientHandlerRegister';
import { getPlayerOrRespondError } from './utils';

export const handleCreateRoom = (context: Context, socket: Socket) => (
    request: Request<CreateRoomPayload>,
) => {
    const player = getPlayerOrRespondError(context, socket, request);
    if (!player) {
        return;
    }
    const roomConfig = context.roomConfig;
    const failureResponse = roomConfig.preCreate(player, request);
    if (failureResponse) {
        player.emit(failureResponse);
        return;
    }

    roomConfig.onCreate(player, request);
};

clientHandlerRegister.push(MessageType.CREATE_ROOM, handleCreateRoom);
