import { Context, Socket } from '../objects';
import { getPlayer } from '../utils/stateUtils';
import clientHandlerRegister from '../clientHandlerRegister';
import { MessageType, Request } from '@prisel/common';

const handleGameStart = (context: Context, socket: Socket) => (request: Request) => {
    const player = getPlayer(context, socket);
    if (!player) {
        // player hasn't login yet
        // TODO(minor) give some error message to client
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
