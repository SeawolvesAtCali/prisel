import { Context, Socket } from './objects';

import { emit } from './networkUtils';
import * as roomMessages from './message/room';

export const handleDisplayConnection = (context: Context) => (client: Socket) => {
    client.on('PING', () => {
        emit(client, ...roomMessages.getPong());
    });
};
