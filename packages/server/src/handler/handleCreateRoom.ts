import { priselpb } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { getPlayerOrRespondError, verifyIsRequest } from './utils';

export const handleCreateRoom: Handler = (context, socket) => (request) => {
    if (!verifyIsRequest(request)) {
        return;
    }
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

clientHandlerRegister.push(priselpb.SystemActionType.CREATE_ROOM, handleCreateRoom);
