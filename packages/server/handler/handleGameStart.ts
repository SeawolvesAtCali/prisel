import { priselpb } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { getPlayerOrRespondError, verifyIsRequest } from './utils';

const handleGameStart: Handler = (context, socket) => (request) => {
    if (!verifyIsRequest(request)) {
        return;
    }
    const player = getPlayerOrRespondError(context, socket, request);
    if (!player) {
        return;
    }
    const { roomConfig, gameConfig } = context;
    const failureResponse = roomConfig.preGameStart(player, request, gameConfig.canStart);
    if (failureResponse) {
        player.emit(failureResponse);
        return;
    }
    roomConfig.onGameStart(player, request);
};

clientHandlerRegister.push(priselpb.SystemActionType.GAME_START, handleGameStart);
