import { priselpb } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { getPlayerOrRespondError, verifyIsRequest } from './utils';

export const handleJoin: Handler = (context, socket) => (request) => {
    if (!verifyIsRequest(request)) {
        return;
    }
    const player = getPlayerOrRespondError(context, socket, request);
    if (!player) {
        return;
    }
    const { roomConfig } = context;
    const failureResponse = roomConfig.preJoin(player, request);
    if (failureResponse) {
        player.emit(failureResponse);
        return;
    }

    roomConfig.onJoin(player, request);
};

clientHandlerRegister.push(priselpb.SystemActionType.JOIN, handleJoin);
