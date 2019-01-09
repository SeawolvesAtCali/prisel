import { Context, Room, Socket } from '../objects';
import partial from 'lodash/partial';
import { emit, closeSocket } from '../utils/networkUtils';
import { MessageType } from '@prisel/common';
import * as messages from '../message/room';
import { newId } from '../utils/idUtils';
import { updateClientWithRoomData } from '../utils/updateUtils';
import clientHandlerRegister from '../clientHandlerRegister';

import debug from '../debug';
import { RoomId } from '../objects/room';
import { ClientId } from '../objects/client';
import { getRoom, getClient } from '../utils/stateUtils';
import { GAME_PHASE } from '../objects/gamePhase';

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
    closeSocket(socket);
    if (!SocketManager.hasSocket(socket)) {
        // client has not logged in yet. Nothing to clean up.
        return;
    }
    const room = getRoom(context, socket);
    if (room) {
        handleLeaveImpl(context, socket)(data);
        updateClientWithRoomData(context, room.id);
    }
    const clientId = SocketManager.getId(socket);
    SocketManager.removeBySocket(socket);
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
    const currentRoom = getRoom(context, socket);
    if (currentRoom) {
        // already in a room
        emit(
            socket,
            ...messages.getFailure(MessageType.CREATE_ROOM, `ALREADY IN A ROOM ${currentRoom.id}`),
        );
        return;
    }
    const roomId = newId<RoomId>('ROOM');
    const room: Room = {
        id: roomId,
        name: roomName,
        host: hostId,
        guests: [],
        clients: [],
        gamePhase: GAME_PHASE.WAITING,
    };
    updateState((draftState) => void (draftState.rooms[roomId] = room));
    setClientRoomAttributes(context, hostId, roomId);
    debug(`roomController: ${hostId} created room ${roomName} ${roomId}`);
    emit(socket, ...messages.getCreateRoomSuccess(roomId));
    updateClientWithRoomData(context, roomId);
};

type ErrorMessage = string;

const attemptJoinRoom = (context: Context, socket: Socket, roomId: ClientId): ErrorMessage => {
    const { updateState, StateManager } = context;
    const currentRoom = getRoom(context, socket);
    const client = getClient(context, socket);
    if (currentRoom) {
        return `ALREADY IN A ROOM ${currentRoom.id}`;
    }
    if (!StateManager.rooms[roomId]) {
        return 'ROOM DOES NOT EXIST';
    }

    if (client) {
        updateState((draftState) => void draftState.rooms[roomId].guests.push(client.id));
        setClientRoomAttributes(context, client.id, roomId);
    }
    return '';
};

export const handleJoin = (context: Context, socket: Socket) => (data: { roomId: string }) => {
    const { roomId } = data;
    const attempJoinRoomError = attemptJoinRoom(context, socket, roomId);
    if (attempJoinRoomError === '') {
        emit(socket, ...messages.getJoinSuccess());
    } else {
        emit(socket, ...messages.getFailure(MessageType.JOIN, attempJoinRoomError));
    }
    updateClientWithRoomData(context, roomId);
};

export const handleLeaveImpl = (context: Context, socket: Socket) => (data: {}) => {
    const { SocketManager, updateState } = context;
    const clientId = SocketManager.getId(socket);
    let roomId: string;
    updateState((draftState) => {
        const client = draftState.connections[clientId];
        if (!client) {
            return;
        }
        roomId = client.roomId;
        delete client.roomId;
        delete client.isReady;
        if (roomId === undefined) {
            return;
        }
        const room = draftState.rooms[roomId];
        if (room.host === client.id) {
            // handle host leaving
            // host is leaving, promote another guest to host
            const nextHost = room.guests.shift();
            if (nextHost) {
                room.host = nextHost;
            } else {
                // no one is in the room, remove the room
                delete draftState.rooms[roomId];
            }
        } else {
            // handle guest leaving
            const { guests } = room;
            guests.splice(guests.indexOf(client.id), 1);
        }
    });
};

export const handleLeave = (context: Context, socket: Socket) => (data: {}) => {
    const currentRoom = getRoom(context, socket);
    handleLeaveImpl(context, socket)(data);
    if (currentRoom) {
        emit(socket, ...messages.getLeaveSuccess());
        updateClientWithRoomData(context, currentRoom.id);
    }
};

export const handleKick = (context: Context, socket: Socket) => (data: { userId: ClientId }) => {
    const { SocketManager, StateManager } = context;
    const { userId } = data;
    const getKickFailure = partial(messages.getFailure, MessageType.KICK);
    const host = getClient(context, socket);
    if (!host) {
        return;
    }
    const guest = StateManager.connections[userId];
    if (!guest) {
        emit(socket, ...getKickFailure('User not exist'));
        return;
    }
    if (host.id === guest.id) {
        emit(socket, ...getKickFailure('Cannot self kick'));
        return;
    }
    if (guest.roomId !== host.roomId) {
        emit(socket, ...getKickFailure('Not in the same room'));
        return;
    }
    const room = getRoom(context, socket);
    if (!room) {
        emit(socket, ...getKickFailure('Not in a room'));
        return;
    }
    if (room.host !== host.id) {
        emit(socket, ...getKickFailure('Not enough privilage'));
        return;
    }

    handleLeave(context, SocketManager.getSocket(guest.id))({});
    emit(socket, ...messages.getKickSuccess());
    updateClientWithRoomData(context, room.id);
};

clientHandlerRegister.push([MessageType.CREATE_ROOM, handleCreateRoom]);
clientHandlerRegister.push([MessageType.JOIN, handleJoin]);
clientHandlerRegister.push([MessageType.LEAVE, handleLeave]);
clientHandlerRegister.push([MessageType.KICK, handleKick]);
clientHandlerRegister.push([MessageType.EXIT, handleExit]);
