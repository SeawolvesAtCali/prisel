import { MessageType, LoginPayload, JoinPayload, CreateRoomPayload } from './messageTypes';
import { Packet, Request, Response, PacketType } from './packet';
import { Code } from './code';

/**
 * message from server to client once a client connects
 */
const welcome: Packet<never> = {
    type: PacketType.DEFAULT,
    system_action: MessageType.WELCOME,
};

/**
 * report status for certain action request
 */
const feedback: Response<any> = {
    type: PacketType.RESPONSE,
    system_action: MessageType.CREATE_ROOM,
    status: {
        code: Code.OK,
    },
    request_id: '123',
};

/**
 * request from client to server to log user in.
 * Server will respond with
 * ```
 * <Response> {
 *  type: PacketType.RESPONSE,
 *  system_action: MessageTypes.LOGIN,
 *  id: '123',
 *  status: Status.SUCCESS
 * }
 * ```
 */
const login: Request<LoginPayload> = {
    type: PacketType.REQUEST,
    system_action: MessageType.LOGIN,
    request_id: '123',
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
    system_action: MessageType.JOIN,
    request_id: '123',
    payload: {
        roomId: 'room-1',
    },
};

const createRoom: Request<CreateRoomPayload> = {
    type: PacketType.REQUEST,
    system_action: MessageType.CREATE_ROOM,
    request_id: '123',
    payload: {
        roomName: 'room-1',
    },
};

const leave: Request<never> = {
    type: PacketType.REQUEST,
    request_id: '123',
    system_action: MessageType.LEAVE,
};

const exit: Packet<never> = {
    type: PacketType.DEFAULT,
    system_action: MessageType.EXIT,
};

const gameStart: Request<never> = {
    type: PacketType.REQUEST,
    request_id: '123',
    system_action: MessageType.GAME_START,
};
