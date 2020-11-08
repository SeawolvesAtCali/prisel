import { Packet, Request } from '@prisel/common';
import {
    chat_spec,
    create_room_spec,
    join_spec,
    login_spec,
    system_action_type,
} from '@prisel/protos';

const { SystemActionType } = system_action_type;
/**
 * Login
 * @param {String} username
 */
export function getLogin(requestId: string, username: string) {
    return Request.forSystemAction<login_spec.LoginRequest>(SystemActionType.LOGIN)
        .setId(requestId)
        .setPayload(login_spec.LoginRequest, { username })
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
    return Request.forSystemAction<join_spec.JoinRequest>(SystemActionType.JOIN)
        .setId(requestId)
        .setPayload(join_spec.JoinRequest, {
            roomId,
        })
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
    return Request.forSystemAction<create_room_spec.CreateRoomRequest>(SystemActionType.CREATE_ROOM)
        .setId(requestId)
        .setPayload(create_room_spec.CreateRoomRequest, {
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
    return Packet.forSystemAction<chat_spec.ChatPayload>(SystemActionType.CHAT)
        .setPayload(chat_spec.ChatPayload, {
            message,
        })
        .build();
}

export function getGetRoomState(requestId: string) {
    return Request.forSystemAction(SystemActionType.GET_ROOM_STATE).setId(requestId).build();
}

export function getGetLobbyState(requestId: string): Request {
    return Request.forSystemAction(SystemActionType.GET_ROOM_STATE).setId(requestId).build();
}
