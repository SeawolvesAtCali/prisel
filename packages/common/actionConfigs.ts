import * as messageTypes from './messageTypes';

enum FROM {
    UNSPECIFIED = '',
    SERVER = 'Server',
    CLIENT = 'Client',
}

interface ActionConfig {
    desc: string;
    from: FROM;
    isRest: boolean;
    payload?: Array<[string, string]>;
    related?: messageTypes.ActionName[];
}
const request = <T>(requestPayload: string): [string, string] => ['request', requestPayload];
const response = <T>(responsePayload: string): [string, string] => ['response', responsePayload];
const packet = <T>(packetPayload: string): [string, string] => ['packet', packetPayload];

export const ACTION_CONFIG: Record<messageTypes.ActionName, ActionConfig> = {
    UNSPECIFIED: {
        desc: 'Default value of action',
        from: FROM.UNSPECIFIED,
        isRest: false,
    },
    WELCOME: {
        desc: 'Welcome new client connection',
        from: FROM.SERVER,
        isRest: false,
    },
    LOGIN: {
        desc: 'Client login with username and retrieve a user ID',
        from: FROM.CLIENT,
        isRest: true,
        payload: [
            request<messageTypes.LoginPayload>('LoginPayload'),
            response<messageTypes.LoginResponsePayload>('LoginResponsePayload'),
        ],
    },
    JOIN: {
        desc: 'Client join a room',
        from: FROM.CLIENT,
        isRest: true,
        payload: [
            request<messageTypes.JoinPayload>('JoinPayload'),
            response<messageTypes.JoinResponsePayload>('JoinResponsePayload'),
        ],
        related: ['ROOM_STATE_CHANGE'],
    },
    ROOM_STATE_CHANGE: {
        desc: 'Room state change due to players joining or leaving',
        from: FROM.SERVER,
        isRest: false,
        payload: [packet<messageTypes.RoomChangePayload>('RoomChangePayload')],
    },
    CREATE_ROOM: {
        desc: 'Client create a room',
        from: FROM.CLIENT,
        isRest: true,
        payload: [
            request<messageTypes.CreateRoomPayload>('CreateRoomPayload'),
            response<messageTypes.CreateRoomResponsePayload>('CreateRoomResponsePayload'),
        ],
    },
    LEAVE: {
        desc: 'Client leave a room',
        from: FROM.CLIENT,
        isRest: true,
        related: ['ROOM_STATE_CHANGE'],
    },
    EXIT: {
        desc: 'Client exit the game and close connection',
        from: FROM.CLIENT,
        isRest: false,
        related: ['ROOM_STATE_CHANGE'],
    },
    GAME_START: {
        desc: 'Host declare game start',
        from: FROM.CLIENT,
        isRest: true,
        related: ['ANNOUNCE_GAME_START'],
    },
    CHAT: {
        desc: 'Client send chat message to room',
        from: FROM.CLIENT,
        isRest: false,
        payload: [packet<messageTypes.ChatPayload>('ChatPayload')],
        related: ['BROADCAST'],
    },
    BROADCAST: {
        desc: "Broadcast client's message to the room",
        from: FROM.SERVER,
        isRest: false,
        payload: [packet<messageTypes.BroadcastPayload>('BroadcastPayload')],
        related: ['CHAT'],
    },
    ANNOUNCE_GAME_START: {
        desc: 'Broadcast game start to players in the room',
        from: FROM.SERVER,
        isRest: false,
        related: ['GAME_START'],
    },
    ERROR: {
        desc:
            'Report error to client, usually responding to a packet. If an error is related to a request, a response should be used instead.',
        from: FROM.SERVER,
        isRest: false,
        payload: [packet<messageTypes.ErrorPayload>('ErrorPayload')],
    },
    GET_ROOM_STATE: {
        desc: 'Client request a snapshot of current room state.',
        from: FROM.CLIENT,
        isRest: true,
        payload: [response<messageTypes.RoomStateResponsePayload>('RoomStateResponsePayload')],
    },
};
