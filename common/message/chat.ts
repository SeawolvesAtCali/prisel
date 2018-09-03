enum Type {
    /**
     * Server broadcast client's message to anyone that are titled to accept
     */
    BROADCAST = 'BROADCAST',
    /**
     * Client send public chat
     */
    CHAT = 'CHAT',
    /**
     * Client send messag to room
     */
    CHAT_TO_ROOM = 'CHAT_TO_ROOM',
    /**
     * Client request chat history from server
     */
    CHAT_HISTORY = 'CHAT_HISTORY',
}

export default Type;
