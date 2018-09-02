import { Message } from '../objects';

/**
 * Ping server to see if connected.
 * Server will respond 'PONG' if connected.
 */
export function getPing(): Message {
    return ['PING', {}];
}
/**
 * Login
 * @param {String} username
 */
export function getLogin(username: string): Message {
    return ['LOGIN', { username }];
}
/**
 * In case of disconnection, reconnect as userId
 * @param {String} userId
 */
export function getReconnect(userId: string): Message {
    return ['RECONNECT', { userId }];
}
/**
 * Join room
 * @param {String} roomId
 */
export function getJoin(roomId: string): Message {
    return ['JOIN', { roomId }];
}
/**
 * Leave current room
 */
export function getLeave(): Message {
    return ['LEAVE', {}];
}
/**
 * Get ready for game start
 */
export function getReady(): Message {
    return ['READY', {}];
}
/**
 *  Host start the game
 */
export function getStart(): Message {
    return ['START', {}];
}
/**
 * Host kick a user out of the room
 * @param {String} targetUserId
 */
export function getKick(targetUserId: string): Message {
    return ['KICK', { userId: targetUserId }];
}
/**
 * Create a room
 * @param {String} roomName
 */
export function getCreateRoom(roomName: string): Message {
    return ['CREATE_ROOM', { roomName }];
}
