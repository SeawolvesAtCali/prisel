import { Context, Socket } from '../objects';
import { getHandle, getClient } from '../utils/stateUtils';
import { GAME_PHASE } from '../objects/gamePhase';
import clientHandlerRegister from '../clientHandlerRegister';
import { MessageType } from '@prisel/common';

export const handleGameStart = (context: Context, socket: Socket) => (data: {}) => {
    const handle = getHandle(context, socket);
    const client = getClient(context, socket);
    if (handle && handle.gamePhase === GAME_PHASE.WAITING) {
        handle.room.onGameStart(handle, client.id, data);
    }
};

clientHandlerRegister.push([MessageType.GAME_START, handleGameStart]);
