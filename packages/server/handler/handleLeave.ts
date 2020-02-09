import { Context, Socket } from '../objects';
import { MessageType, Request } from '@prisel/common';
import clientHandlerRegister from '../clientHandlerRegister';
import { getPlayer } from '../utils/stateUtils';

export const handleLeave = (context: Context, socket: Socket) => (request: Request) => {
    const player = getPlayer(context, socket);
    if (!player) {
        // player hasn't login yet
        // TODO(minor) give some error message to client
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
