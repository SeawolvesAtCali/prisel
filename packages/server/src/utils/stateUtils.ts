import { priselpb } from '@prisel/protos';
import { Context, Socket } from '../objects';
import { Player } from '../player';
import { Room } from '../room';

// Some utility functions for working with state

/**
 * Get the client from the StateManager using client's socket connection.
 * @param context
 * @param client
 */
export function getPlayer(context: Context | undefined, client: Socket | undefined): Player | void {
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
export function getRoom(context: Context, client: Socket): Room | null {
    if (!context || !client) {
        return null;
    }
    const player = getPlayer(context, client);
    if (player) {
        return player.getRoom();
    }
    return null;
}

export function getRoomStateSnapshot(room: Room): priselpb.RoomStateSnapshot {
    const host = room.getHost();

    const players = room.getPlayers().map((player) => getPlayerInfo(player));
    const token = room.getStateToken();
    if (host) {
        return {
            players,
            hostId: host.getId(),
            token,
        };
    }
    return {
        players: room.getPlayers().map((player) => getPlayerInfo(player)),
        token: room.getStateToken(),
    };
}

export function getPlayerInfo(player: Player): priselpb.PlayerInfo {
    return {
        name: player.getName(),
        id: player.getId(),
    };
}

export function getRoomInfo(room: Room): priselpb.RoomInfo {
    return {
        name: room.getName(),
        id: room.getId(),
    };
}
