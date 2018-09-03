import { Context, Room, Socket, StateManager as StateManagerT } from './objects';
import omit from 'lodash/omit';
import partial from 'lodash/partial';
import { emit } from './networkUtils';
import RoomType from '../common/message/room';
import * as messages from './message/room';
import { newId } from './idUtils';
import { updateClientWithRoomData } from './updateUtils';

import debug from './debug';

export const addClientToRoom = (context: Context, clientId: string, roomId: string) => {
    const { StateManager, SocketManager } = context;
    const { controllers } = StateManager.connections;

    controllers[clientId] = {
        ...controllers[clientId],
        isReady: false,
        roomId,
    };

    const socket = SocketManager.getSocket(clientId);
    socket.join(roomId);
};

export const handleCreateRoom = (context: Context, client: Socket) => (data: {
    roomName: string;
}) => {
    const { roomName } = data;
    const { SocketManager, StateManager } = context;
    const hostId = SocketManager.getId(client);
    const roomId = newId('ROOM');
    const room: Room = {
        id: roomId,
        name: roomName,
        host: hostId,
        guests: [],
        displays: [],
    };
    StateManager.rooms[roomId] = room;
    addClientToRoom(context, hostId, roomId);
    debug(`roomController: ${hostId} created room ${roomName} ${roomId}`);
    emit(client, ...messages.getCreateRoomSuccess(roomId));
    updateClientWithRoomData(context, roomId);
};

const attemptJoinRoom = (context: Context, clientId: string, roomId: string): string => {
    const room = context.StateManager.rooms[roomId];
    if (room === undefined) {
        return 'ROOM DOES NOT EXIST';
    }

    if (room.host === clientId || room.guests.includes(clientId)) {
        return 'ALREADY JOINED ROOM';
    }

    room.guests = [...room.guests, clientId];
    addClientToRoom(context, clientId, roomId);

    return '';
};

const handleJoin = (context: Context, client: Socket) => (data: { roomId: string }) => {
    const { roomId } = data;

    const { SocketManager } = context;
    const clientId = SocketManager.getId(client);
    const attempJoinRoomError = attemptJoinRoom(context, clientId, roomId);
    if (attempJoinRoomError === '') {
        emit(client, ...messages.getJoinSuccess());
    } else {
        emit(client, ...messages.getFailure(RoomType.JOIN, attempJoinRoomError));
    }
    updateClientWithRoomData(context, roomId);
};

const attemptRemoveHost = (StateManager: StateManagerT, room: Room) => {
    // host is leaving, promote another guest to host
    const nextHost = room.guests.shift();
    if (nextHost !== undefined) {
        room.host = nextHost;
    } else {
        // no one is in the room, remove the room
        StateManager.rooms = omit(StateManager.rooms, room.id);
    }
};

const attemptRemoveGuest = (room: Room, clientId: string) => {
    room.guests = room.guests.filter((guestId: string) => guestId !== clientId);
};

export const handleLeave = (context: Context, client: Socket) => (data: {}) => {
    const { SocketManager, StateManager } = context;
    const clientId = SocketManager.getId(client);
    const controller = StateManager.connections.controllers[clientId];
    const { roomId } = controller;
    StateManager.connections.controllers[clientId] = omit(controller, 'roomId', 'isReady');
    if (roomId !== undefined) {
        const room = StateManager.rooms[roomId];
        if (room.host === clientId) {
            attemptRemoveHost(StateManager, room);
        } else {
            attemptRemoveGuest(room, clientId);
        }
        updateClientWithRoomData(context, roomId);
    }
};

const handleKick = (context: Context, client: Socket) => (data: { userId: string }) => {
    const { SocketManager, StateManager } = context;
    const hostId = SocketManager.getId(client);
    const { userId } = data;
    const getKickFailure = partial(messages.getFailure, RoomType.KICK);
    if (hostId === userId) {
        emit(client, ...getKickFailure('Cannot self kick'));
        return;
    }
    const controller = StateManager.connections.controllers[hostId];
    const { roomId } = controller;
    if (!roomId) {
        emit(client, ...getKickFailure('Not in a room'));
        return;
    }
    const room = StateManager.rooms[roomId];
    if (room.host !== hostId) {
        emit(client, ...getKickFailure('Not enough privilage'));
        return;
    }

    handleLeave(context, SocketManager.getSocket(userId))({});
    emit(client, ...messages.getKickSuccess());
    updateClientWithRoomData(context, roomId);
};

export function handleRoomActions(context: Context, client: Socket) {
    client.on(RoomType.CREATE_ROOM, handleCreateRoom(context, client));
    client.on(RoomType.JOIN, handleJoin(context, client));
    client.on(RoomType.LEAVE, handleLeave(context, client));
    client.on(RoomType.KICK, handleKick(context, client));
}
