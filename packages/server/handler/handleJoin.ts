import { MessageType, JoinPayload, Request } from '@prisel/common';
import { Socket, Context } from '../objects';
import { getPlayer } from '../utils/stateUtils';
import clientHandlerRegister from '../clientHandlerRegister';

export const handleJoin = (context: Context, socket: Socket) => (request: Request<JoinPayload>) => {
    const player = getPlayer(context, socket);
    if (!player) {
        // player hasn't login yet
        // TODO(minor) give some error message to client
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
