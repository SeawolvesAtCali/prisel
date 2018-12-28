import { Context, Socket, Room, Client } from '../objects';

// Some utility functions for working with state

/**
 * Get the client from the StateManager using client's socket connection.
 * @param context
 * @param client
 */
export function getClient(context: Context, client: Socket): Client | void {
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
export function getRoom(context: Context, client: Socket): Room | void {
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
