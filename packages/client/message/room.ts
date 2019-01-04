import { Message } from '../objects';
import { MessageType } from '@prisel/common';

/**
 * Login
 * @param {String} username
 */
export function getLogin(username: string): Message {
    return [MessageType.LOGIN, { username }];
}

/**
 * Exit server
 */
export function getExit(): Message {
    return [MessageType.EXIT, {}];
}
/**
 * In case of disconnection, reconnect as userId
 * @param {String} userId
 */
export function getReconnect(userId: string): Message {
    return [MessageType.RECONNECT, { userId }];
}
/**
 * Join room
 * @param {String} roomId
 */
export function getJoin(roomId: string): Message {
    return [MessageType.JOIN, { roomId }];
}
/**
 * Leave current room
 */
export function getLeave(): Message {
    return [MessageType.LEAVE, {}];
}
/**
 * Get ready for game start
 */
export function getReady(): Message {
    return [MessageType.READY, {}];
}

export function getUnready(): Message {
    return [MessageType.UNREADY, {}];
}

/**
 * Host kick a user out of the room
 * @param {String} targetUserId
 */
export function getKick(targetUserId: string): Message {
    return [MessageType.KICK, { userId: targetUserId }];
}
/**
 * Create a room
 * @param {String} roomName
 */
export function getCreateRoom(roomName: string): Message {
    return [MessageType.CREATE_ROOM, { roomName }];
}
