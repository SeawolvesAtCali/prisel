import { MessageType, LoginPayload, JoinPayload, CreateRoomPayload } from './messageTypes';
import { Packet, Request, Response, PacketType, Status } from './packet';

/**
 * message from server to client once a client connects
 */
const welcome: Packet<never> = {
    type: PacketType.DEFAULT,
    systemAction: MessageType.WELCOME,
};

/**
 * report status for certain action request
 */
const feedback: Response<any> = {
    type: PacketType.RESPONSE,
    systemAction: MessageType.CREATE_ROOM,
    status: Status.SUCCESS,
    id: '123',
};

/**
 * request from client to server to log user in.
 * Server will respond with
 * ```
 * <Response> {
 *  type: PacketType.RESPONSE,
 *  systemAction: MessageTypes.LOGIN,
 *  id: '123',
 *  status: Status.SUCCESS
 * }
 * ```
 */
const login: Request<LoginPayload> = {
    type: PacketType.REQUEST,
    systemAction: MessageType.LOGIN,
    id: '123',
    payload: {
        username: 'superman',
    },
};

/**
 * request from client to server to join a room.
 * Server will send back a Response
 */
const join: Request<JoinPayload> = {
    type: PacketType.REQUEST,
    systemAction: MessageType.JOIN,
    id: '123',
    payload: {
        roomId: 'room-1',
    },
};

const createRoom: Request<CreateRoomPayload> = {
    type: PacketType.REQUEST,
    systemAction: MessageType.CREATE_ROOM,
    id: '123',
    payload: {
        roomName: 'room-1',
    },
};

const leave: Request<never> = {
    type: PacketType.REQUEST,
    id: '123',
    systemAction: MessageType.LEAVE,
};

const exit: Packet<never> = {
    type: PacketType.DEFAULT,
    systemAction: MessageType.EXIT,
};

const gameStart: Request<never> = {
    type: PacketType.REQUEST,
    id: '123',
    systemAction: MessageType.GAME_START,
};
