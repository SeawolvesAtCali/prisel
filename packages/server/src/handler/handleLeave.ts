import { priselpb } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { GAME_PHASE } from '../objects/gamePhase';
import { getRoom } from '../utils/stateUtils';
import { getPlayerOrRespondError, verifyIsRequest } from './utils';

export const handleLeave: Handler = (context, socket) => (request) => {
    if (!verifyIsRequest(request)) {
        return;
    }
    const player = getPlayerOrRespondError(context, socket, request);
    if (!player) {
        return;
    }
    const { roomConfig, gameConfig } = context;
    const failureResponse = roomConfig.preLeave(player, request);
    if (failureResponse) {
        player.emit(failureResponse);
        return;
    }

    const room = getRoom(context, socket);
    roomConfig.onLeave(player, request);

    if (!room?.isClosed && room?.getGamePhase() === GAME_PHASE.GAME) {
        gameConfig.onRemovePlayer(room, player);
    }
};

clientHandlerRegister.push(priselpb.SystemActionType.LEAVE, handleLeave);
