import { Context, Socket } from '../objects';

import { Player } from '../player';
import { Room } from '../room';
import { RoomStateSnapshot } from '@prisel/common';
import { PlayerInfo } from '@prisel/common';
import { RoomInfo } from '@prisel/common';

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

export function getRooms(context: Context): Room[] {
    if (!context) {
        return [];
    }
    return Array.from(context.rooms.values());
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

export function getRoomStateSnapshot(room: Room): RoomStateSnapshot {
    const host = room.getHost();

    return {
        players: room.getPlayers().map((player) => getPlayerInfo(player)),
        hostId: host ? host.getId() : null,
        token: room.getStateToken(),
    };
}

export function getPlayerInfo(player: Player): PlayerInfo {
    return {
        name: player.getName(),
        id: player.getId(),
    };
}

export function getRoomInfo(room: Room): RoomInfo {
    return {
        name: room.getName(),
        id: room.getId(),
    };
}
