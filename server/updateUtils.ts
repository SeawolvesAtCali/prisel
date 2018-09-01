import { Context, Room, StateManager } from './objects';

import pick from 'lodash/pick';
import { emitToControllers, emitToDisplays } from './networkUtils';
import * as roomMessages from './message/room';

const denormalizeRoom = (StateManager: StateManager, room: Room) => ({
    ...room,
    controllers: pick(StateManager.connections.controllers, [room.host, ...room.guests]),
});

export const updateClientWithRoomData = (context: Context, roomId: string) => {
    const { StateManager, io } = context;
    const room = StateManager.rooms[roomId];
    if (room) {
        const roomData = denormalizeRoom(StateManager, room);
        emitToControllers(io, room.id, ...roomMessages.getRoomUpdate(roomData));
        emitToDisplays(io, room.id, ...roomMessages.getRoomUpdate(roomData));
    }
};
