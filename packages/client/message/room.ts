import { Message } from '../objects';
import { RoomType } from '@prisel/common';

/**
 * Ping server to see if connected.
 * Server will respond RoomType.PONG if connected.
 */
export function getPing(): Message {
    return [RoomType.PING, {}];
}
/**
 * Login
 * @param {String} username
 */
export function getLogin(username: string): Message {
    return [RoomType.LOGIN, { username }];
}

/**
 * Exit server
 */
export function getExit(): Message {
    return [RoomType.EXIT, {}];
}
/**
 * In case of disconnection, reconnect as userId
 * @param {String} userId
 */
export function getReconnect(userId: string): Message {
    return [RoomType.RECONNECT, { userId }];
}
/**
 * Join room
 * @param {String} roomId
 */
export function getJoin(roomId: string): Message {
    return [RoomType.JOIN, { roomId }];
}
/**
 * Leave current room
 */
export function getLeave(): Message {
    return [RoomType.LEAVE, {}];
}
/**
 * Get ready for game start
 */
export function getReady(): Message {
    return [RoomType.READY, {}];
}

export function getUnready(): Message {
    return [RoomType.UNREADY, {}];
}

/**
 *  Host start the game
 */
export function getStart(): Message {
    return [RoomType.GAME_START, {}];
}
/**
 * Host kick a user out of the room
 * @param {String} targetUserId
 */
export function getKick(targetUserId: string): Message {
    return [RoomType.KICK, { userId: targetUserId }];
}
/**
 * Create a room
 * @param {String} roomName
 */
export function getCreateRoom(roomName: string): Message {
    return [RoomType.CREATE_ROOM, { roomName }];
}
