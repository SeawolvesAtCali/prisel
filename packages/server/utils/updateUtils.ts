import { Context, Room, StateManager as StateManagerT } from '../objects';

import pick from 'lodash/pick';
import { broadcast } from './networkUtils';
import * as roomMessages from '../message/room';

const denormalizeRoom = (StateManager: StateManagerT, room: Room) => ({
    ...room,
    clients: pick(StateManager.connections, [room.host, ...room.guests]),
});

export const updateClientWithRoomData = (context: Context, roomId: string) => {
    Promise.resolve().then(() => {
        const { StateManager, server } = context;
        const room = StateManager.rooms[roomId];
        if (room) {
            const roomData = denormalizeRoom(StateManager, room);
            broadcast(context, room.id, ...roomMessages.getRoomUpdate(roomData));
        }
    });
};
