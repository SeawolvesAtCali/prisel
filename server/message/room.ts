import { Message } from '../objects';
/**
 * functions to create messages.
 * Each function should return an array.
 * The first parameter of the array is the type of the message,
 * the rest are the content
 */

export function getPong(): Message {
    return ['PONG', {}];
}
/**
 * Success response for client login
 * @param {String} userId
 */
export function getLoginAccept(userId: string): Message {
    return ['LOGIN_ACCEPT', { userId }];
}
/**
 * Success response for client joining room
 */
export function getJoinAccept(): Message {
    return ['JOIN_ACCEPT', {}];
}
/**
 * Error response for client joinomg room
 * @param {String} errorType
 */
export function getJoinError(errorType: string): Message {
    return ['JOIN_ERROR', { errorType }];
}
/**
 * Success response for client leaving room
 */
export function getLeaveAccept(): Message {
    return ['LEAVE_ACCEPT', {}];
}
/**
 * Host successfully kick a user out of the room
 */
export function getKickAccept(): Message {
    return ['KICK_ACCEPT', {}];
}
/**
 * Cannot kick user out of the room
 * @param {*} errorType
 */
export function getKickError(errorType: string): Message {
    return ['KICK_ERROR', { errorType }];
}
/**
 * Success response for client ready
 */
export function getReadyAccept(): Message {
    return ['READY_ACCEPT', {}];
}
/**
 * Host start the game
 */
export function getGameStart(): Message {
    return ['GAME_START', {}];
}
/**
 * Success response for client creating room
 * @param {String} roomId
 */
export function getCreateRoomAccept(roomId: string): Message {
    return ['CREATE_ROOM_ACCEPT', { roomId }];
}
/**
 * Error response for client creating room
 * @param {String} errorType
 */
export function getCreateRoomError(errorType: string): Message {
    return ['CREATE_ROOM_ERROR', { errorType }];
}

export function getRoomUpdate(roomData: Object): Message {
    return ['ROOM_UPDATE', roomData];
}
