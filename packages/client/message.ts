import { Packet, Request } from '@prisel/common';
import { priselpb } from '@prisel/protos';

const { SystemActionType } = priselpb;
/**
 * Login
 * @param {String} username
 */
export function getLogin(requestId: string, username: string) {
    return Request.forSystemAction(SystemActionType.LOGIN)
        .setId(requestId)
        .setPayload('loginRequest', {
            username,
        })
        .build();
}

/**
 * Exit server
 */
export function getExit() {
    return Packet.forSystemAction(SystemActionType.EXIT).build();
}

/**
 * Join room
 * @param {String} roomId
 */
export function getJoin(requestId: string, roomId: string) {
    return Request.forSystemAction(SystemActionType.JOIN)
        .setId(requestId)
        .setPayload('joinRequest', { roomId })
        .build();
}

/**
 * Leave current room
 */
export function getLeave(requestId: string) {
    return Request.forSystemAction(SystemActionType.LEAVE).setId(requestId).build();
}

/**
 * Create a room
 * @param {String} roomName
 */
export function getCreateRoom(requestId: string, roomName: string) {
    return Request.forSystemAction(SystemActionType.CREATE_ROOM)
        .setId(requestId)
        .setPayload('createRoomRequest', {
            roomName,
        })
        .build();
}

export function getGameStart(requestId: string) {
    return Request.forSystemAction(SystemActionType.GAME_START).setId(requestId).build();
}

/**
 * Send a public message
 * @param {String} userId
 * @param {String} message
 */
export function getChat(message: string) {
    return Packet.forSystemAction(SystemActionType.CHAT)
        .setPayload('chatPayload', {
            message,
        })
        .build();
}

export function getGetRoomState(requestId: string) {
    return Request.forSystemAction(SystemActionType.GET_ROOM_STATE).setId(requestId).build();
}

export function getGetLobbyState(requestId: string): Request {
    return Request.forSystemAction(SystemActionType.GET_LOBBY_STATE).setId(requestId).build();
}
