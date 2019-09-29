enum MessageType {
    WELCOME = 'WELCOME',
    RECONNECT = 'RECONNECT',
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    LOGIN = 'LOGIN',
    JOIN = 'JOIN',
    CREATE_ROOM = 'CREATE_ROOM',
    LEAVE = 'LEAVE',
    EXIT = 'EXIT',
    KICK = 'KICK',
    READY = 'READY',
    UNREADY = 'UNREADY',
    GAME_START = 'GAME_START',
    ROOM_UPDATE = 'ROOM_UPDATE',
    /**
     * Client send messag to room
     */
    BROADCAST = 'BROADCAST',
    /**
     * Client send public chat
     */
    CHAT = 'CHAT',
    /**
     * Client request chat history from server
     */
    CHAT_HISTORY = 'CHAT_HISTORY',
    GAME_STATE = 'GAME_STATE',
    /**
     * A player move
     * @deprecated use MESSAGE instead
     */
    MOVE = 'MOVE',

    /**
     * Customizable message for developer to extend
     */
    MESSAGE = 'MESSAGE',

    GET_GAME_AND_ROOM_TYPES = 'GET_GAME_AND_ROOM_TYPES',
}

export default MessageType;

export function isMessageType(value: any): value is MessageType {
    return Object.values(MessageType).includes(value as MessageType);
}
