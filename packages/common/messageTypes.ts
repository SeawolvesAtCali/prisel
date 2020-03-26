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
    ERROR = 12,
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

export interface PlayerInfo {
    name: string;
    id: string;
}

// Token is used to prevent lost packets. When client receives a new
// UpdateToken, they should compare if the previousToken matches the current
// token saved in the client, if so, no packet was dropped, and they should
// update the saved token to be the new token.
export interface UpdateToken {
    previousToken?: string;
    token?: string;
}
export interface RoomChangePayload {
    // deprecated
    newJoins?: string[];
    // deprecated
    newLeaves?: string[];
    // deprecated
    newHost?: string;

    playerJoin?: PlayerInfo;
    hostJoin?: PlayerInfo;
    playerLeave?: {
        id: string;
    };
    hostLeave?: {
        hostId: string;
        newHostId?: string;
    };

    token?: UpdateToken;
}

export interface RoomStatePayload {
    players: PlayerInfo[];
    hostId: string;
    token: string;
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

export interface ErrorPayload {
    message?: string;
    detail?: any;
}

export default MessageType;

export function isMessageType(value: any): value is MessageType {
    return Object.values(MessageType).includes(value as MessageType);
}

export type ActionName = keyof typeof MessageType;

export const messageTypeMap = enumToMap<MessageType>(MessageType);
