import { Context, Socket } from '../objects';
import { MessageType } from '@prisel/common';

import clientHandlerRegister from '../clientHandlerRegister';

import { getClient, getHandle } from '../utils/stateUtils';

export const handleLeave = (context: Context, socket: Socket) => (data: {}) => {
    const client = getClient(context, socket);
    const handle = getHandle(context, socket);
    if (handle && client) {
        handle.room.onLeave(handle, client.id, data);
    }
};

clientHandlerRegister.push([MessageType.LEAVE, handleLeave]);
