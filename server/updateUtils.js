// @flow
import type { ContextT, RoomT, StateManagerT } from './objects';

const pick = require('lodash/pick');
const networkUtils = require('./networkUtils');
const roomMessages = require('./message/room');

const denormalizeRoom = (StateManager: StateManagerT, room: RoomT) => ({
    ...room,
    controllers: pick(StateManager.connections.controllers, [room.host, ...room.guests]),
});

const updateClientWithRoomData = (context: ContextT, roomId: string) => {
    const { StateManager, io } = context;
    const room = StateManager.rooms[roomId];
    if (room) {
        const roomData = denormalizeRoom(StateManager, room);
        networkUtils.emitToControllers(io, room.id, ...roomMessages.getRoomUpdate(roomData));
        networkUtils.emitToDisplays(io, room.id, ...roomMessages.getRoomUpdate(roomData));
    }
};

module.exports = {
    updateClientWithRoomData,
};
