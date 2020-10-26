import {
    broadcast_spec,
    chat_spec,
    create_room_spec,
    error_spec,
    get_lobby_state_spec,
    get_room_state_spec,
    join_spec,
    login_spec,
    room_state_change_spec,
    system_action_type,
} from '@prisel/protos';
import { enumToMap } from './enumToMap';

const { SystemActionType } = system_action_type;
const systemActionTypeMap = enumToMap(SystemActionType);

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
    related?: system_action_type.SystemActionType[];
}
const request = (requestPayload: { typeUrl: string }): [string, string] => [
    'request',
    requestPayload.typeUrl,
];
const response = (responsePayload: { typeUrl: string }): [string, string] => [
    'response',
    responsePayload.typeUrl,
];
const packet = (packetPayload: { typeUrl: string }): [string, string] => [
    'packet',
    packetPayload.typeUrl,
];

const RAW_ACTION_CONFIG: Record<system_action_type.SystemActionType, ActionConfig> = {
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
        payload: [request(login_spec.LoginRequest), response(login_spec.LoginResponse)],
    },
    [SystemActionType.JOIN]: {
        desc: 'Client join a room',
        from: FROM.CLIENT,
        isRest: true,
        payload: [request(join_spec.JoinRequest), response(join_spec.JoinResponse)],
        related: [SystemActionType.ROOM_STATE_CHANGE],
    },
    [SystemActionType.ROOM_STATE_CHANGE]: {
        desc: 'Room state change due to players joining or leaving',
        from: FROM.SERVER,
        isRest: false,
        payload: [packet(room_state_change_spec.RoomStateChangePayload)],
    },
    [SystemActionType.CREATE_ROOM]: {
        desc: 'Client create a room',
        from: FROM.CLIENT,
        isRest: true,
        payload: [
            request(create_room_spec.CreateRoomRequest),
            response(create_room_spec.CreateRoomResponse),
        ],
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
        payload: [packet(chat_spec.ChatPayload)],
        related: [SystemActionType.BROADCAST],
    },
    [SystemActionType.BROADCAST]: {
        desc: "Broadcast client's message to the room",
        from: FROM.SERVER,
        isRest: false,
        payload: [packet(broadcast_spec.BroadcastPayload)],
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
        payload: [packet(error_spec.ErrorPayload)],
    },
    [SystemActionType.GET_ROOM_STATE]: {
        desc: 'Client request a snapshot of current room state.',
        from: FROM.CLIENT,
        isRest: true,
        payload: [response(get_room_state_spec.GetRoomStateResponse)],
    },
    [SystemActionType.GET_LOBBY_STATE]: {
        desc: 'Client request a snapshot of current lobby state.',
        from: FROM.CLIENT,
        isRest: true,
        payload: [response(get_lobby_state_spec.GetLobbyStateResponse)],
    },
};

export const ACTION_CONFIG = Object.entries(RAW_ACTION_CONFIG).map(([key, value]) => ({
    type: systemActionTypeMap.get(Number(key)),
    ...value,
    related: value.related
        ? value.related.map((actionType) => systemActionTypeMap.get(actionType))
        : [],
}));
