import {
    MessageType,
    Request,
    LoginPayload,
    PacketType,
    Packet,
    JoinPayload,
    CreateRoomPayload,
    ChatPayload,
} from '@prisel/common';

/**
 * Login
 * @param {String} username
 */
export function getLogin(requestId: string, username: string): Request<LoginPayload> {
    return {
        type: PacketType.REQUEST,
        system_action: MessageType.LOGIN,
        request_id: requestId,
        payload: {
            username,
        },
    };
}

/**
 * Exit server
 */
export function getExit(): Packet {
    return {
        type: PacketType.DEFAULT,
        system_action: MessageType.EXIT,
    };
}

/**
 * Join room
 * @param {String} roomId
 */
export function getJoin(requestId: string, roomId: string): Request<JoinPayload> {
    return {
        type: PacketType.REQUEST,
        system_action: MessageType.JOIN,
        request_id: requestId,
        payload: {
            roomId,
        },
    };
}

/**
 * Leave current room
 */
export function getLeave(requestId: string): Request<never> {
    return {
        type: PacketType.REQUEST,
        system_action: MessageType.LEAVE,
        request_id: requestId,
    };
}

/**
 * Create a room
 * @param {String} roomName
 */
export function getCreateRoom(requestId: string, roomName: string): Request<CreateRoomPayload> {
    return {
        type: PacketType.REQUEST,
        system_action: MessageType.CREATE_ROOM,
        request_id: requestId,
        payload: {
            roomName,
        },
    };
}

export function getGameStart(requestId: string): Request<never> {
    return {
        type: PacketType.REQUEST,
        system_action: MessageType.GAME_START,
        request_id: requestId,
    };
}

/**
 * Send a public message
 * @param {String} userId
 * @param {String} message
 */
export function getChat(message: string): Packet<ChatPayload> {
    return {
        type: PacketType.DEFAULT,
        system_action: MessageType.CHAT,
        payload: {
            message,
        },
    };
}

export function getGetRoomState(requestId: string): Request {
    return {
        type: PacketType.REQUEST,
        system_action: MessageType.GET_ROOM_STATE,
        request_id: requestId,
    };
}

export function getGetLobbyState(requestId: string): Request {
    return {
        type: PacketType.REQUEST,
        system_action: MessageType.GET_LOBBY_STATE,
        request_id: requestId,
    };
}
