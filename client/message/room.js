module.exports = {
    /**
     * Login
     * @param {String} username
     */
    getLogin(username) {
        return ['LOGIN', { username }];
    },
    /**
     * In case of disconnection, reconnect as userId
     * @param {String} userId
     */
    getReconnect(userId) {
        return ['RECONNECT', { userId }];
    },
    /**
     * Join room
     * @param {String} roomId
     */
    getJoin(roomId) {
        return ['JOIN', { roomId }];
    },
    /**
     * Leave current room
     */
    getLeave() {
        return ['LEAVE', {}];
    },
    /**
     * Get ready for game start
     */
    getReady() {
        return ['READY', {}];
    },
    /**
     *  Host start the game
     */
    getStart() {
        return ['START', {}];
    },
    /**
     * Host kick a user out of the room
     * @param {String} targetUserId
     */
    getKick(targetUserId) {
        return ['KICK', { userId: targetUserId }];
    },
    /**
     * Create a room
     * @param {String} roomName
     */
    getCreateRoom(roomName) {
        return ['CREATE_ROOM', { roomName }];
    },
};
