import { Context, Room, StateManager as StateManagerT } from '../objects';

import pick from 'lodash/pick';
import { broadcast } from './networkUtils';
import * as roomMessages from '../message/room';

const denormalizeRoom = (StateManager: StateManagerT, room: Room) => ({
    ...room,
    clientMap: pick(StateManager.connections, room.players),
});

export const updateClientWithRoomData = (context: Context, roomId: string) => {
    if (context.StateManager.rooms[roomId].players.length > 0) {
        Promise.resolve().then(() => {
            const { StateManager } = context;
            const room = StateManager.rooms[roomId];
            if (room) {
                const roomData = denormalizeRoom(StateManager, room);
                broadcast(context, room.id, ...roomMessages.getRoomUpdate(roomData));
            }
        });
    }
};
