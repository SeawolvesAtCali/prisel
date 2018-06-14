module.exports = {
    /**
     * Send a public message
     * @param {String} userId
     * @param {String} message
     */
    getChat(userId, message) {
        return ['CHAT', { userId, message }];
    },
    /**
     * Send a chat message to a room
     * @param {String} message
     */
    getChatToRoom(message) {
        return ['CHAT_TO_ROOM', { message }];
    },
    /**
     * Get chat history after certain message
     * @param {String} messageId
     */
    getChatHistoryAfter(messageId) {
        return ['CHAT_HISTORY', { after: messageId }];
    },
};
