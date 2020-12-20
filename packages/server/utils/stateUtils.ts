import { player_info, room_info, room_state_snapshot } from '@prisel/protos';
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

export function getRoomStateSnapshot(room: Room): room_state_snapshot.RoomStateSnapshot {
    const host = room.getHost();

    return {
        players: room.getPlayers().map((player) => getPlayerInfo(player)),
        hostId: host ? host.getId() : null,
        token: room.getStateToken(),
    };
}

export function getPlayerInfo(player: Player): player_info.PlayerInfo {
    return {
        name: player.getName(),
        id: player.getId(),
    };
}

export function getRoomInfo(room: Room): room_info.RoomInfo {
    return {
        name: room.getName(),
        id: room.getId(),
    };
}
