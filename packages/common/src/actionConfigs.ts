import { priselpb } from '@prisel/protos';
import { PayloadKey } from './packet';

const { SystemActionType } = priselpb;

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
    related?: priselpb.SystemActionType[];
}
const request = (key: PayloadKey): [string, string] => ['request', key];
const response = (key: PayloadKey): [string, string] => ['response', key];
const packet = (key: PayloadKey): [string, string] => ['packet', key];

const RAW_ACTION_CONFIG: Record<priselpb.SystemActionType, ActionConfig> = {
    [SystemActionType.UNSPECIFIED]: {
        desc: 'Default value of action',
        from: FROM.UNSPECIFIED,
        isRest: false,
    },
    [SystemActionType.WELCOME]: {
        desc: 'Welcome new client connection',
        from: FROM.SERVER,
        isRest: false,
    },
    [SystemActionType.LOGIN]: {
        desc: 'Client login with username and retrieve a user ID',
        from: FROM.CLIENT,
        isRest: true,
        payload: [request('loginRequest'), response('loginResponse')],
    },
    [SystemActionType.JOIN]: {
        desc: 'Client join a room',
        from: FROM.CLIENT,
        isRest: true,
        payload: [request('joinRequest'), response('joinResponse')],
        related: [SystemActionType.ROOM_STATE_CHANGE],
    },
    [SystemActionType.ROOM_STATE_CHANGE]: {
        desc: 'Room state change due to players joining or leaving',
        from: FROM.SERVER,
        isRest: false,
        payload: [packet('roomStateChangePayload')],
    },
    [SystemActionType.CREATE_ROOM]: {
        desc: 'Client create a room',
        from: FROM.CLIENT,
        isRest: true,
        payload: [request('createRoomRequest'), response('createRoomResponse')],
    },
    [SystemActionType.LEAVE]: {
        desc: 'Client leave a room',
        from: FROM.CLIENT,
        isRest: true,
        related: [SystemActionType.ROOM_STATE_CHANGE],
    },
    [SystemActionType.EXIT]: {
        desc: 'Client exit the game and close connection',
        from: FROM.CLIENT,
        isRest: false,
        related: [SystemActionType.ROOM_STATE_CHANGE],
    },
    [SystemActionType.GAME_START]: {
        desc: 'Host declare game start',
        from: FROM.CLIENT,
        isRest: true,
        related: [SystemActionType.ANNOUNCE_GAME_START],
    },
    [SystemActionType.CHAT]: {
        desc: 'Client send chat message to room',
        from: FROM.CLIENT,
        isRest: false,
        payload: [packet('chatPayload')],
        related: [SystemActionType.BROADCAST],
    },
    [SystemActionType.BROADCAST]: {
        desc: "Broadcast client's message to the room",
        from: FROM.SERVER,
        isRest: false,
        payload: [packet('broadcastPayload')],
        related: [SystemActionType.CHAT],
    },
    [SystemActionType.ANNOUNCE_GAME_START]: {
        desc: 'Broadcast game start to players in the room',
        from: FROM.SERVER,
        isRest: false,
        related: [SystemActionType.GAME_START],
    },
    [SystemActionType.ERROR]: {
        desc:
            'Report error to client, usually responding to a packet. If an error is related to a request, a response should be used instead.',
        from: FROM.SERVER,
        isRest: false,
        payload: [packet('errorPayload')],
    },
    [SystemActionType.GET_ROOM_STATE]: {
        desc: 'Client request a snapshot of current room state.',
        from: FROM.CLIENT,
        isRest: true,
        payload: [response('getRoomStateResponse')],
    },
    [SystemActionType.GET_LOBBY_STATE]: {
        desc: 'Client request a snapshot of current lobby state.',
        from: FROM.CLIENT,
        isRest: true,
        payload: [response('getLobbyStateResponse')],
    },
};

export const ACTION_CONFIG = Object.entries(RAW_ACTION_CONFIG).map(([key, value]) => ({
    type: priselpb.SystemActionType[Number(key)],
    ...value,
    related: value.related ? value.related.map((actionType) => SystemActionType[actionType]) : [],
}));
