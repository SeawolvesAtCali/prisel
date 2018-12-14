import WebSocket from 'ws';
import { Context, Room, Socket } from '../objects';
import partial from 'lodash/partial';
import { emit, closeSocket } from '../networkUtils';
import RoomType from '@monopoly/common/lib/message/room';
import * as messages from '../message/room';
import { newId } from '../idUtils';
import { updateClientWithRoomData } from '../updateUtils';
import clientHandlerRegister from '../clientHandlerRegister';

import debug from '../debug';
import { RoomId } from '../objects/room';
import { ClientId } from '../objects/client';

export const setClientRoomAttributes = (context: Context, clientId: ClientId, roomId: RoomId) => {
    const { updateState } = context;
    updateState((draftState) => {
        const client = draftState.connections[clientId];
        client.isReady = false;
        client.roomId = roomId;
    });
};

export const handleExit = (context: Context, socket: Socket) => (data: {}) => {
    const { SocketManager, updateState } = context;
    const roomId = handleLeaveImpl(context, socket)(data);
    updateClientWithRoomData(context, roomId);
    const clientId = SocketManager.getId(socket);
    SocketManager.removeBySocket(socket);
    closeSocket(socket);
    updateState((draft) => {
        delete draft.connections[clientId];
    });
};

export const handleCreateRoom = (context: Context, socket: Socket) => (data: {
    roomName: string;
}) => {
    const { roomName } = data;
    const { SocketManager, updateState } = context;
    const hostId = SocketManager.getId(socket);
    const roomId = newId<RoomId>('ROOM');
    const room: Room = {
        id: roomId,
        name: roomName,
        host: hostId,
        guests: [],
    };
    updateState((draftState) => void (draftState.rooms[roomId] = room));
    setClientRoomAttributes(context, hostId, roomId);
    debug(`roomController: ${hostId} created room ${roomName} ${roomId}`);
    emit(socket, ...messages.getCreateRoomSuccess(roomId));
    updateClientWithRoomData(context, roomId);
};

type ErrorMessage = string;

const attemptJoinRoom = (context: Context, clientId: ClientId, roomId: ClientId): ErrorMessage => {
    const { updateState } = context;
    const room = context.StateManager.rooms[roomId];
    if (room === undefined) {
        return 'ROOM DOES NOT EXIST';
    }

    if (room.host === clientId || room.guests.includes(clientId)) {
        return 'ALREADY JOINED ROOM';
    }

    updateState((draftState) => void draftState.rooms[roomId].guests.push(clientId));
    setClientRoomAttributes(context, clientId, roomId);

    return '';
};

const handleJoin = (context: Context, socket: Socket) => (data: { roomId: string }) => {
    const { roomId } = data;

    const { SocketManager } = context;
    const clientId = SocketManager.getId(socket);
    const attempJoinRoomError = attemptJoinRoom(context, clientId, roomId);
    if (attempJoinRoomError === '') {
        emit(socket, ...messages.getJoinSuccess());
    } else {
        emit(socket, ...messages.getFailure(RoomType.JOIN, attempJoinRoomError));
    }
    updateClientWithRoomData(context, roomId);
};

const handleLeaveImpl = (context: Context, socket: Socket) => (data: {}) => {
    const { SocketManager, updateState } = context;
    const clientId = SocketManager.getId(socket);
    let roomId: string;
    updateState((draftState) => {
        const client = draftState.connections[clientId];
        roomId = client.roomId;
        delete client.roomId;
        delete client.isReady;
        if (roomId === undefined) {
            return;
        }
        const room = draftState.rooms[roomId];
        if (room.host === clientId) {
            // handle host leaving
            // host is leaving, promote another guest to host
            const nextHost = room.guests.shift();
            if (nextHost !== undefined) {
                room.host = nextHost;
            } else {
                // no one is in the room, remove the room
                delete draftState.rooms[roomId];
            }
        } else {
            // handle guest leaving
            const { guests } = room;
            guests.splice(guests.indexOf(clientId), 1);
        }
    });
    return roomId;
};

export const handleLeave = (context: Context, socket: Socket) => (data: {}) => {
    const roomId = handleLeaveImpl(context, socket)(data);
    if (roomId) {
        emit(socket, ...messages.getLeaveSuccess());
        updateClientWithRoomData(context, roomId);
    }
};

export const handleKick = (context: Context, socket: Socket) => (data: { userId: ClientId }) => {
    const { SocketManager, StateManager } = context;
    const { userId } = data;
    const hostId = SocketManager.getId(socket);
    const getKickFailure = partial(messages.getFailure, RoomType.KICK);
    if (hostId === userId) {
        emit(socket, ...getKickFailure('Cannot self kick'));
        return;
    }
    const client = StateManager.connections[hostId];
    const { roomId } = client;
    if (!roomId) {
        emit(socket, ...getKickFailure('Not in a room'));
        return;
    }
    const room = StateManager.rooms[roomId];
    if (room.host !== hostId) {
        emit(socket, ...getKickFailure('Not enough privilage'));
        return;
    }

    handleLeave(context, SocketManager.getSocket(userId))({});
    emit(socket, ...messages.getKickSuccess());
    updateClientWithRoomData(context, roomId);
};

clientHandlerRegister.push([RoomType.CREATE_ROOM, handleCreateRoom]);
clientHandlerRegister.push([RoomType.JOIN, handleJoin]);
clientHandlerRegister.push([RoomType.LEAVE, handleLeave]);
clientHandlerRegister.push([RoomType.KICK, handleKick]);
clientHandlerRegister.push([RoomType.EXIT, handleExit]);
