import { Context, Socket } from '../objects';
import { getHandle, getClient } from '../utils/stateUtils';
import clientHandlerRegister from '../clientHandlerRegister';
import { MessageType } from '@prisel/common';

const handleMessage = (context: Context, socket: Socket) => (data: any) => {
    const handle = getHandle(context, socket);
    const client = getClient(context, socket);
    if (handle) {
        handle.game.onMessage(handle, client.id, data);
    }
};

clientHandlerRegister.push([MessageType.MESSAGE, handleMessage]);
