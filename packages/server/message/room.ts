import { Message } from '../objects';
import RoomType from '@monopoly/common/lib/message/room';

/**
 * functions to create messages.
 * Each function should return an array.
 * The first parameter of the array is the type of the message,
 * the rest are the content
 */

export function getPong(): Message {
    return [RoomType.PONG, {}];
}

export function getSuccess(action: RoomType, data: object): Message {
    return [RoomType.SUCCESS, { action, ...data }];
}

export function getFailure(action: RoomType, error: string): Message {
    return [RoomType.FAILURE, { action, error }];
}

/**
 * Success response for client login
 * @param {String} userId
 */
export function getLoginSuccess(userId: string) {
    return getSuccess(RoomType.LOGIN, { userId });
}
/**
 * Success response for client joining room
 */
export function getJoinSuccess() {
    return getSuccess(RoomType.JOIN, {});
}

/**
 * Success response for client leaving room
 */
export function getLeaveSuccess() {
    return getSuccess(RoomType.LEAVE, {});
}
/**
 * Host successfully kick a user out of the room
 */
export function getKickSuccess() {
    return getSuccess(RoomType.KICK, {});
}

/**
 * Success response for client ready
 */
export function getReadySuccess() {
    return getSuccess(RoomType.READY, {});
}
/**
 * Host start the game
 */
export function getGameStartSuccess() {
    return getSuccess(RoomType.GAME_START, {});
}
/**
 * Success response for client creating room
 * @param {String} roomId
 */
export function getCreateRoomSuccess(roomId: string) {
    return getSuccess(RoomType.CREATE_ROOM, { roomId });
}

export function getRoomUpdate(roomData: object): Message {
    return [RoomType.ROOM_UPDATE, roomData];
}
