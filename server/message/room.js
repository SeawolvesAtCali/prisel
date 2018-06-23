/**
 * functions to create messages.
 * Each function should return an array.
 * The first parameter of the array is the type of the message,
 * the rest are the content
 */

module.exports = {
    /**
     * Success response for client login
     * @param {String} userId
     */
    getLoginAccept(userId) {
        return ['LOGIN_ACCEPT', { userId }];
    },
    /**
     * Success response for client joining room
     */
    getJoinAccept() {
        return ['JOIN_ACCEPT', {}];
    },
    /**
     * Error response for client joinomg room
     * @param {String} errorType
     */
    getJoinError(errorType) {
        return ['JOIN_ERROR', { errorType }];
    },
    /**
     * Success response for client leaving room
     */
    getLeaveAccept() {
        return ['LEAVE_ACCEPT', {}];
    },
    /**
     * Success response for client ready
     */
    getReadyAccept() {
        return ['READY_ACCEPT', {}];
    },
    /**
     * Host start the game
     */
    getGameStart() {
        return ['GAME_START', {}];
    },
    /**
     * Success response for client creating room
     * @param {String} roomId
     */
    getCreateRoomAccept(roomId) {
        return ['CREATE_ROOM_ACCEPT', { roomId }];
    },
    /**
     * Error response for client creating room
     * @param {String} errorType
     */
    getCreateRoomError(errorType) {
        return ['CREATE_ROOM_ERROR', { errorType }];
    },
};
