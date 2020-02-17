import { Context, Socket } from '../objects';
import clientHandlerRegister from '../clientHandlerRegister';
import { MessageType, Request } from '@prisel/common';
import { getPlayerOrRespondError } from './utils';

const handleGameStart = (context: Context, socket: Socket) => (request: Request) => {
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

clientHandlerRegister.push(MessageType.GAME_START, handleGameStart);
