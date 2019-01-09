import { Message } from '../objects';
import { MessageType } from '@prisel/common';

/**
 * functions to create messages.
 * Each function should return an array.
 * The first parameter of the array is the type of the message,
 * the rest are the content
 */

export function getWelcome(): Message {
    return [MessageType.WELCOME, {}];
}

export function getSuccess(action: MessageType, data: object): Message {
    return [MessageType.SUCCESS, { action, ...data }];
}

export function getFailure(action: MessageType, error: string): Message {
    return [MessageType.FAILURE, { action, error }];
}

/**
 * Success response for client login
 * @param {String} userId
 */
export function getLoginSuccess(userId: string) {
    return getSuccess(MessageType.LOGIN, { userId });
}
/**
 * Success response for client joining room
 */
export function getJoinSuccess() {
    return getSuccess(MessageType.JOIN, {});
}

/**
 * Success response for client leaving room
 */
export function getLeaveSuccess() {
    return getSuccess(MessageType.LEAVE, {});
}
/**
 * Host successfully kick a user out of the room
 */
export function getKickSuccess() {
    return getSuccess(MessageType.KICK, {});
}

/**
 * Success response for client ready
 */
export function getReadySuccess() {
    return getSuccess(MessageType.READY, {});
}
/**
 * Host start the game
 */
export function getGameStartSuccess() {
    return getSuccess(MessageType.GAME_START, {});
}
/**
 * Success response for client creating room
 * @param {String} roomId
 */
export function getCreateRoomSuccess(roomId: string) {
    return getSuccess(MessageType.CREATE_ROOM, { roomId });
}

export function getRoomUpdate(roomData: object): Message {
    return [MessageType.ROOM_UPDATE, roomData];
}

export function getMessage(data: any): Message {
    return [MessageType.MESSAGE, data];
}
