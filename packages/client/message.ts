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
        systemAction: MessageType.LOGIN,
        id: requestId,
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
        systemAction: MessageType.EXIT,
    };
}

/**
 * Join room
 * @param {String} roomId
 */
export function getJoin(requestId: string, roomId: string): Request<JoinPayload> {
    return {
        type: PacketType.REQUEST,
        systemAction: MessageType.JOIN,
        id: requestId,
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
        systemAction: MessageType.LEAVE,
        id: requestId,
    };
}

/**
 * Create a room
 * @param {String} roomName
 */
export function getCreateRoom(requestId: string, roomName: string): Request<CreateRoomPayload> {
    return {
        type: PacketType.REQUEST,
        systemAction: MessageType.CREATE_ROOM,
        id: requestId,
        payload: {
            roomName,
        },
    };
}

export function getGameStart(requestId: string): Request<never> {
    return {
        type: PacketType.REQUEST,
        systemAction: MessageType.GAME_START,
        id: requestId,
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
        systemAction: MessageType.CHAT,
        payload: {
            message,
        },
    };
}
