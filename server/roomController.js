// @flow

import type { ContextT, RoomT, SocketT, StateManagerT } from './objects';

const debug = require('debug')('debug');
const omit = require('lodash/omit');
const pick = require('lodash/pick');
const networkUtils = require('./networkUtils');
const roomMessages = require('./message/room');
const { newId } = require('./idUtils');

const denormalizeRoom = (StateManager: StateManagerT, room: RoomT) => ({
    ...room,
    controllers: pick(StateManager.connections.controllers, [room.host, ...room.guests]),
});

const updateClientWithRoomData = (context: ContextT, roomId: string) => {
    const { StateManager, io } = context;
    const room = StateManager.rooms[roomId];
    if (room) {
        const roomData = denormalizeRoom(StateManager, room);
        networkUtils.emitToControllers(io, room.id, ...roomMessages.getRoomUpdate(roomData));
        networkUtils.emitToDisplays(io, room.id, ...roomMessages.getRoomUpdate(roomData));
    }
};
const addClientToRoom = (context: ContextT, clientId: string, roomId: string) => {
    const { StateManager, SocketManager } = context;
    const { controllers } = StateManager.connections;

    controllers[clientId] = {
        ...controllers[clientId],
        isReady: false,
        roomId,
    };

    const socket = SocketManager.getSocket(clientId);
    socket.join(roomId);
    updateClientWithRoomData(context, roomId);
};

const handleCreateRoom = (context: ContextT, client: SocketT) => (data: { roomName: string }) => {
    const { roomName } = data;
    const { SocketManager, StateManager } = context;
    const hostId = SocketManager.getId(client);
    const roomId = newId('ROOM');
    const room = {
        id: roomId,
        name: roomName,
        host: hostId,
        guests: [],
        displays: [],
    };
    StateManager.rooms[roomId] = room;
    addClientToRoom(context, hostId, roomId);
    debug(`roomController: ${hostId} created room ${roomName} ${roomId}`);
    networkUtils.emit(client, ...roomMessages.getCreateRoomAccept(roomId));
    updateClientWithRoomData(context, roomId);
};

const attemptJoinRoom = (context: ContextT, clientId: string, roomId: string): string => {
    const room: RoomT | void = context.StateManager.rooms[roomId];
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

const handleJoin = (context: ContextT, client: SocketT) => (data: { roomId: string }) => {
    const { roomId } = data;

    const { SocketManager } = context;
    const clientId = SocketManager.getId(client);
    const attempJoinRoomError = attemptJoinRoom(context, clientId, roomId);
    if (attempJoinRoomError === '') {
        networkUtils.emit(client, ...roomMessages.getJoinAccept());
    } else {
        networkUtils.emit(client, ...roomMessages.getJoinError(attempJoinRoomError));
    }
    updateClientWithRoomData(context, roomId);
};

const attemptRemoveHost = (StateManager: StateManagerT, room: RoomT) => {
    // host is leaving, promote another guest to host
    const nextHost = room.guests.shift();
    if (nextHost !== undefined) {
        room.host = nextHost;
    } else {
        // no one is in the room, remove the room
        StateManager.rooms = omit(StateManager.rooms, room.id);
    }
};

const attemptRemoveGuest = (room: RoomT, clientId: string) => {
    room.guests = room.guests.filter((guestId: string) => guestId !== clientId);
};

const handleLeave = (context: ContextT, client: SocketT) => (data: {}) => {
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

const handleKick = (context: ContextT, client: SocketT) => (data: { userId: string }) => {
    const { SocketManager, StateManager } = context;
    const hostId = SocketManager.getId(client);
    const { userId } = data;
    if (hostId === userId) {
        networkUtils.emit(client, ...roomMessages.getKickError('Cannot self kick'));
        return;
    }
    const controller = StateManager.connections.controllers[hostId];
    const { roomId } = controller;
    if (!roomId) {
        networkUtils.emit(client, ...roomMessages.getKickError('Not in a room'));
        return;
    }
    const room = StateManager.rooms[roomId];
    if (room.host !== hostId) {
        networkUtils.emit(client, ...roomMessages.getKickError('Not enough privilage'));
        return;
    }

    handleLeave(context, SocketManager.getSocket(userId))({});
    networkUtils.emit(client, ...roomMessages.getKickAccept());
    updateClientWithRoomData(context, roomId);
};

function handleRoomActions(context: ContextT, client: SocketT) {
    client.on('CREATE_ROOM', handleCreateRoom(context, client));
    client.on('JOIN', handleJoin(context, client));
    client.on('LEAVE', handleLeave(context, client));
    client.on('KICK', handleKick(context, client));
}

module.exports = {
    addClientToRoom,
    handleCreateRoom,
    handleRoomActions,
    handleLeave,
};
