import { Context, Socket } from './objects';

import { emit } from './networkUtils';
import * as roomMessages from './message/room';
import RoomType from '../common/message/room';

export const handleDisplayConnection = (context: Context) => (client: Socket) => {
    client.on(RoomType.PING, () => {
        emit(client, ...roomMessages.getPong());
    });
};
