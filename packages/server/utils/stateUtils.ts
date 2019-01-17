import { Context, Socket, Room, Client } from '../objects';
import Handle from './handle';
import { newId } from './idUtils';
import { RoomId } from '../objects/room';
import { GAME_PHASE } from '../objects/gamePhase';

// Some utility functions for working with state

/**
 * Get the client from the StateManager using client's socket connection.
 * @param context
 * @param client
 */
export function getClient(context: Context, client: Socket): Client {
    if (!context || !client) {
        return;
    }
    const { SocketManager, StateManager } = context;
    const userId = SocketManager.getId(client);
    if (userId) {
        return StateManager.connections[userId];
    }
}

/**
 * Get the client's room from the StateManager using client's socket connection.
 * @param context
 * @param client
 */
export function getRoom(context: Context, client: Socket): Room {
    if (!context || !client) {
        return;
    }
    const { StateManager } = context;
    const clientData = getClient(context, client);
    if (clientData) {
        const { roomId } = clientData;
        if (roomId) {
            return StateManager.rooms[roomId];
        }
    }
}

export function getHandle(context: Context, client: Socket): Handle {
    const room = getRoom(context, client);
    if (room) {
        return context.handles[room.id];
    }
}

export function addRoom(context: Context, roomName: string): Room {
    let id: RoomId;
    return context.updateState((draftState) => {
        id = newId<RoomId>('ROOM');
        const room: Room = {
            id,
            name: roomName,
            players: [],
            gamePhase: GAME_PHASE.WAITING,
        };
        draftState.rooms[id] = room;
    }).rooms[id];
}
