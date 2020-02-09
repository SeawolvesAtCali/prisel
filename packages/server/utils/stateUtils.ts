import { Context, Socket } from '../objects';

import { Player } from '../player';
import { Room } from '../room';

// Some utility functions for working with state

/**
 * Get the client from the StateManager using client's socket connection.
 * @param context
 * @param client
 */
export function getPlayer(context: Context, client: Socket): Player | void {
    if (!context || !client) {
        return;
    }
    const { SocketManager } = context;
    const userId = SocketManager.getId(client);
    if (userId && context.players.has(userId)) {
        return context.players.get(userId);
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
    const player = getPlayer(context, client);
    if (player) {
        return player.getRoom();
    }
}
