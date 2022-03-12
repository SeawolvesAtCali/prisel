import { priselpb } from '@prisel/protos';
import { Socket } from '../objects';
import { Player } from '../player';
import SocketManager from '../socketManager';

// Some utility functions for working with state

export function getPlayer2(
    socketManager: SocketManager,
    socket: Socket,
    players: Map<string, Player>,
) {
    const userId = socketManager.getId(socket);
    if (!userId) {
        return undefined;
    }
    return players.get(userId);
}

export function getRoomStateSnapshot2(
    players: Player[],
    roomStateToken: string,
    hostId?: string,
): priselpb.RoomStateSnapshot {
    const result: priselpb.RoomStateSnapshot = {
        players: players.map((player) => getPlayerInfo(player)),
        token: roomStateToken,
    };
    if (hostId) {
        result.hostId = hostId;
    }
    return result;
}

export function getPlayerInfo(player: Player): priselpb.PlayerInfo {
    return {
        name: player.getName(),
        id: player.getId(),
    };
}
