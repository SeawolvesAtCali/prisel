enum Type {
    PING = 'PING',
    PONG = 'PONG',
    RECONNECT = 'RECONNECT',
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    LOGIN = 'LOGIN',
    JOIN = 'JOIN',
    CREATE_ROOM = 'CREATE_ROOM',
    LEAVE = 'LEAVE',
    KICK = 'KICK',
    READY = 'READY',
    UNREADY = 'UNREADY',
    GAME_START = 'GAME_START',
    ROOM_UPDATE = 'ROOM_UPDATE',
}

export default Type;
