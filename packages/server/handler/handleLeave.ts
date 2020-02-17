import { Context, Socket } from '../objects';
import { MessageType, Request } from '@prisel/common';
import clientHandlerRegister from '../clientHandlerRegister';
import { getPlayerOrRespondError } from './utils';

export const handleLeave = (context: Context, socket: Socket) => (request: Request) => {
    const player = getPlayerOrRespondError(context, socket, request);
    if (!player) {
        return;
    }
    const roomConfig = context.roomConfig;
    const failureResponse = roomConfig.preLeave(player, request);
    if (failureResponse) {
        player.emit(failureResponse);
        return;
    }

    roomConfig.onLeave(player, request);
};

clientHandlerRegister.push(MessageType.LEAVE, handleLeave);
