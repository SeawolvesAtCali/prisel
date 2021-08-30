import { BufferOffset, nonNull } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import * as flatbuffers from 'flatbuffers';
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
export function buildRoomStateSnapshot(builder: flatbuffers.Builder, room: Room): BufferOffset {
    const host = room.getHost();
    const hostIdOffset = nonNull(host) ? builder.createString(host?.getId()) : null;
    const stateTokenOffset = builder.createString(room.getStateToken());
    const playerInfoOffsets = room.getPlayers().map((player) => player.buildPlayerInfo(builder));

    priselpb.RoomStateSnapshot.startRoomStateSnapshot(builder);

    priselpb.RoomStateSnapshot.addToken(builder, stateTokenOffset);
    priselpb.RoomStateSnapshot.createPlayersVector(builder, playerInfoOffsets);
    if (nonNull(hostIdOffset)) {
        priselpb.RoomStateSnapshot.addHostId(builder, hostIdOffset);
    }

    return priselpb.RoomStateSnapshot.endRoomStateSnapshot(builder);
}
