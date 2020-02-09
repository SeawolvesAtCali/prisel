import { enumToMap } from './enumToMap';
export enum MessageType {
    UNSPECIFIED = 0,
    WELCOME = 1,
    LOGIN = 2,
    JOIN = 3,
    CREATE_ROOM = 4,
    LEAVE = 5,
    EXIT = 6,
    GAME_START = 7,
    CHAT = 8,
    BROADCAST = 9,
    ROOM_STATE_CHANGE = 10,
    ANNOUNCE_GAME_START = 11,
}

export interface LoginPayload {
    username: string;
}

export interface LoginResponsePayload {
    userId: string;
}
export interface JoinPayload {
    roomId: string;
}

export interface RoomChangePayload {
    newJoins?: string[];
    newLeaves?: string[];
    newHost?: string;
}

export interface CreateRoomPayload {
    roomName: string;
}

export interface RoomInfoPayload {
    id: string;
    name: string;
}

export interface ChatPayload {
    message: string;
}

export interface BroadcastPayload {
    from: { userId: string; username: string };
    message: string;
}

export interface StatusPayload {
    detail: string;
}

export default MessageType;

export function isMessageType(value: any): value is MessageType {
    return Object.values(MessageType).includes(value as MessageType);
}

export type ActionName = keyof typeof MessageType;

export const messageTypeMap = enumToMap<MessageType>(MessageType);

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
    related?: ActionName[];
}
const request = <T>(requestPayload: string): [string, string] => ['request', requestPayload];
const response = <T>(responsePayload: string): [string, string] => ['response', responsePayload];
const packet = <T>(packetPayload: string): [string, string] => ['packet', packetPayload];

export const ACTION_CONFIG: Record<ActionName, ActionConfig> = {
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
            request<LoginPayload>('LoginPayload'),
            response<LoginResponsePayload>('LoginResponsePayload'),
        ],
    },
    JOIN: {
        desc: 'Client join a room',
        from: FROM.CLIENT,
        isRest: true,
        payload: [
            request<JoinPayload>('JoinPayload'),
            response<StatusPayload>('StatusPayload'),
            response<RoomInfoPayload>('RoomInfoPayload'),
        ],
        related: ['ROOM_STATE_CHANGE'],
    },
    ROOM_STATE_CHANGE: {
        desc: 'Room state change due to players joining or leaving',
        from: FROM.SERVER,
        isRest: false,
        payload: [packet<RoomChangePayload>('RoomChangePayload')],
    },
    CREATE_ROOM: {
        desc: 'Client create a room',
        from: FROM.CLIENT,
        isRest: true,
        payload: [
            request<CreateRoomPayload>('CreateRoomPayload'),
            response<RoomInfoPayload>('RoomInfoPayload'),
            response<StatusPayload>('StatusPayload'),
        ],
    },
    LEAVE: {
        desc: 'Client leave a room',
        from: FROM.CLIENT,
        isRest: true,
        payload: [response<StatusPayload>('StatusPayload')],
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
        payload: [response<StatusPayload>('StatusPayload')],
        related: ['ANNOUNCE_GAME_START'],
    },
    CHAT: {
        desc: 'Client send chat message to room',
        from: FROM.CLIENT,
        isRest: false,
        payload: [packet<ChatPayload>('ChatPayload')],
        related: ['BROADCAST'],
    },
    BROADCAST: {
        desc: "Broadcast client's message to the room",
        from: FROM.SERVER,
        isRest: false,
        payload: [packet<BroadcastPayload>('BroadcastPayload')],
        related: ['CHAT'],
    },
    ANNOUNCE_GAME_START: {
        desc: 'Broadcast game start to players in the room',
        from: FROM.SERVER,
        isRest: false,
        related: ['GAME_START'],
    },
};
