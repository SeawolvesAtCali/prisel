import { MessageType, JoinPayload, Request } from '@prisel/common';
import { Socket, Context } from '../objects';
import clientHandlerRegister from '../clientHandlerRegister';
import { getPlayerOrRespondError } from './utils';

export const handleJoin = (context: Context, socket: Socket) => (request: Request<JoinPayload>) => {
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

clientHandlerRegister.push(MessageType.JOIN, handleJoin);
