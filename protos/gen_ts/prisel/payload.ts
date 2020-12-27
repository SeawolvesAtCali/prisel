/* eslint-disable */
import { ChatPayload } from '../prisel/chat_spec';
import { BroadcastPayload } from '../prisel/broadcast_spec';
import { CreateRoomRequest, CreateRoomResponse } from '../prisel/create_room_spec';
import { ErrorPayload } from '../prisel/error_spec';
import { GetLobbyStateResponse } from '../prisel/get_lobby_state_spec';
import { GetRoomStateResponse } from '../prisel/get_room_state_spec';
import { JoinRequest, JoinResponse } from '../prisel/join_spec';
import { LoginRequest, LoginResponse } from '../prisel/login_spec';
import { RoomStateChangePayload } from '../prisel/room_state_change_spec';
import { Writer, Reader } from 'protobufjs/minimal';


export interface Payload {
  payload?: { $case: 'chatPayload', chatPayload: ChatPayload } | { $case: 'broadcastPayload', broadcastPayload: BroadcastPayload } | { $case: 'createRoomRequest', createRoomRequest: CreateRoomRequest } | { $case: 'createRoomResponse', createRoomResponse: CreateRoomResponse } | { $case: 'errorPayload', errorPayload: ErrorPayload } | { $case: 'getLobbyStateResponse', getLobbyStateResponse: GetLobbyStateResponse } | { $case: 'getRoomStateResponse', getRoomStateResponse: GetRoomStateResponse } | { $case: 'joinRequest', joinRequest: JoinRequest } | { $case: 'joinResponse', joinResponse: JoinResponse } | { $case: 'loginRequest', loginRequest: LoginRequest } | { $case: 'loginResponse', loginResponse: LoginResponse } | { $case: 'roomStateChangePayload', roomStateChangePayload: RoomStateChangePayload };
}

const basePayload: object = {
};

export const protobufPackage = 'prisel'

export const Payload = {
  encode(message: Payload, writer: Writer = Writer.create()): Writer {
    if (message.payload?.$case === 'chatPayload') {
      ChatPayload.encode(message.payload.chatPayload, writer.uint32(10).fork()).ldelim();
    }
    if (message.payload?.$case === 'broadcastPayload') {
      BroadcastPayload.encode(message.payload.broadcastPayload, writer.uint32(18).fork()).ldelim();
    }
    if (message.payload?.$case === 'createRoomRequest') {
      CreateRoomRequest.encode(message.payload.createRoomRequest, writer.uint32(26).fork()).ldelim();
    }
    if (message.payload?.$case === 'createRoomResponse') {
      CreateRoomResponse.encode(message.payload.createRoomResponse, writer.uint32(34).fork()).ldelim();
    }
    if (message.payload?.$case === 'errorPayload') {
      ErrorPayload.encode(message.payload.errorPayload, writer.uint32(42).fork()).ldelim();
    }
    if (message.payload?.$case === 'getLobbyStateResponse') {
      GetLobbyStateResponse.encode(message.payload.getLobbyStateResponse, writer.uint32(50).fork()).ldelim();
    }
    if (message.payload?.$case === 'getRoomStateResponse') {
      GetRoomStateResponse.encode(message.payload.getRoomStateResponse, writer.uint32(58).fork()).ldelim();
    }
    if (message.payload?.$case === 'joinRequest') {
      JoinRequest.encode(message.payload.joinRequest, writer.uint32(66).fork()).ldelim();
    }
    if (message.payload?.$case === 'joinResponse') {
      JoinResponse.encode(message.payload.joinResponse, writer.uint32(74).fork()).ldelim();
    }
    if (message.payload?.$case === 'loginRequest') {
      LoginRequest.encode(message.payload.loginRequest, writer.uint32(82).fork()).ldelim();
    }
    if (message.payload?.$case === 'loginResponse') {
      LoginResponse.encode(message.payload.loginResponse, writer.uint32(90).fork()).ldelim();
    }
    if (message.payload?.$case === 'roomStateChangePayload') {
      RoomStateChangePayload.encode(message.payload.roomStateChangePayload, writer.uint32(98).fork()).ldelim();
    }
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): Payload {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...basePayload } as Payload;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.payload = {$case: 'chatPayload', chatPayload: ChatPayload.decode(reader, reader.uint32())};
          break;
        case 2:
          message.payload = {$case: 'broadcastPayload', broadcastPayload: BroadcastPayload.decode(reader, reader.uint32())};
          break;
        case 3:
          message.payload = {$case: 'createRoomRequest', createRoomRequest: CreateRoomRequest.decode(reader, reader.uint32())};
          break;
        case 4:
          message.payload = {$case: 'createRoomResponse', createRoomResponse: CreateRoomResponse.decode(reader, reader.uint32())};
          break;
        case 5:
          message.payload = {$case: 'errorPayload', errorPayload: ErrorPayload.decode(reader, reader.uint32())};
          break;
        case 6:
          message.payload = {$case: 'getLobbyStateResponse', getLobbyStateResponse: GetLobbyStateResponse.decode(reader, reader.uint32())};
          break;
        case 7:
          message.payload = {$case: 'getRoomStateResponse', getRoomStateResponse: GetRoomStateResponse.decode(reader, reader.uint32())};
          break;
        case 8:
          message.payload = {$case: 'joinRequest', joinRequest: JoinRequest.decode(reader, reader.uint32())};
          break;
        case 9:
          message.payload = {$case: 'joinResponse', joinResponse: JoinResponse.decode(reader, reader.uint32())};
          break;
        case 10:
          message.payload = {$case: 'loginRequest', loginRequest: LoginRequest.decode(reader, reader.uint32())};
          break;
        case 11:
          message.payload = {$case: 'loginResponse', loginResponse: LoginResponse.decode(reader, reader.uint32())};
          break;
        case 12:
          message.payload = {$case: 'roomStateChangePayload', roomStateChangePayload: RoomStateChangePayload.decode(reader, reader.uint32())};
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Payload {
    const message = { ...basePayload } as Payload;
    if (object.chatPayload !== undefined && object.chatPayload !== null) {
      message.payload = {$case: 'chatPayload', chatPayload: ChatPayload.fromJSON(object.chatPayload)};
    }
    if (object.broadcastPayload !== undefined && object.broadcastPayload !== null) {
      message.payload = {$case: 'broadcastPayload', broadcastPayload: BroadcastPayload.fromJSON(object.broadcastPayload)};
    }
    if (object.createRoomRequest !== undefined && object.createRoomRequest !== null) {
      message.payload = {$case: 'createRoomRequest', createRoomRequest: CreateRoomRequest.fromJSON(object.createRoomRequest)};
    }
    if (object.createRoomResponse !== undefined && object.createRoomResponse !== null) {
      message.payload = {$case: 'createRoomResponse', createRoomResponse: CreateRoomResponse.fromJSON(object.createRoomResponse)};
    }
    if (object.errorPayload !== undefined && object.errorPayload !== null) {
      message.payload = {$case: 'errorPayload', errorPayload: ErrorPayload.fromJSON(object.errorPayload)};
    }
    if (object.getLobbyStateResponse !== undefined && object.getLobbyStateResponse !== null) {
      message.payload = {$case: 'getLobbyStateResponse', getLobbyStateResponse: GetLobbyStateResponse.fromJSON(object.getLobbyStateResponse)};
    }
    if (object.getRoomStateResponse !== undefined && object.getRoomStateResponse !== null) {
      message.payload = {$case: 'getRoomStateResponse', getRoomStateResponse: GetRoomStateResponse.fromJSON(object.getRoomStateResponse)};
    }
    if (object.joinRequest !== undefined && object.joinRequest !== null) {
      message.payload = {$case: 'joinRequest', joinRequest: JoinRequest.fromJSON(object.joinRequest)};
    }
    if (object.joinResponse !== undefined && object.joinResponse !== null) {
      message.payload = {$case: 'joinResponse', joinResponse: JoinResponse.fromJSON(object.joinResponse)};
    }
    if (object.loginRequest !== undefined && object.loginRequest !== null) {
      message.payload = {$case: 'loginRequest', loginRequest: LoginRequest.fromJSON(object.loginRequest)};
    }
    if (object.loginResponse !== undefined && object.loginResponse !== null) {
      message.payload = {$case: 'loginResponse', loginResponse: LoginResponse.fromJSON(object.loginResponse)};
    }
    if (object.roomStateChangePayload !== undefined && object.roomStateChangePayload !== null) {
      message.payload = {$case: 'roomStateChangePayload', roomStateChangePayload: RoomStateChangePayload.fromJSON(object.roomStateChangePayload)};
    }
    return message;
  },
  fromPartial(object: DeepPartial<Payload>): Payload {
    const message = { ...basePayload } as Payload;
    if (object.payload?.$case === 'chatPayload' && object.payload?.chatPayload !== undefined && object.payload?.chatPayload !== null) {
      message.payload = {$case: 'chatPayload', chatPayload: ChatPayload.fromPartial(object.payload.chatPayload)};
    }
    if (object.payload?.$case === 'broadcastPayload' && object.payload?.broadcastPayload !== undefined && object.payload?.broadcastPayload !== null) {
      message.payload = {$case: 'broadcastPayload', broadcastPayload: BroadcastPayload.fromPartial(object.payload.broadcastPayload)};
    }
    if (object.payload?.$case === 'createRoomRequest' && object.payload?.createRoomRequest !== undefined && object.payload?.createRoomRequest !== null) {
      message.payload = {$case: 'createRoomRequest', createRoomRequest: CreateRoomRequest.fromPartial(object.payload.createRoomRequest)};
    }
    if (object.payload?.$case === 'createRoomResponse' && object.payload?.createRoomResponse !== undefined && object.payload?.createRoomResponse !== null) {
      message.payload = {$case: 'createRoomResponse', createRoomResponse: CreateRoomResponse.fromPartial(object.payload.createRoomResponse)};
    }
    if (object.payload?.$case === 'errorPayload' && object.payload?.errorPayload !== undefined && object.payload?.errorPayload !== null) {
      message.payload = {$case: 'errorPayload', errorPayload: ErrorPayload.fromPartial(object.payload.errorPayload)};
    }
    if (object.payload?.$case === 'getLobbyStateResponse' && object.payload?.getLobbyStateResponse !== undefined && object.payload?.getLobbyStateResponse !== null) {
      message.payload = {$case: 'getLobbyStateResponse', getLobbyStateResponse: GetLobbyStateResponse.fromPartial(object.payload.getLobbyStateResponse)};
    }
    if (object.payload?.$case === 'getRoomStateResponse' && object.payload?.getRoomStateResponse !== undefined && object.payload?.getRoomStateResponse !== null) {
      message.payload = {$case: 'getRoomStateResponse', getRoomStateResponse: GetRoomStateResponse.fromPartial(object.payload.getRoomStateResponse)};
    }
    if (object.payload?.$case === 'joinRequest' && object.payload?.joinRequest !== undefined && object.payload?.joinRequest !== null) {
      message.payload = {$case: 'joinRequest', joinRequest: JoinRequest.fromPartial(object.payload.joinRequest)};
    }
    if (object.payload?.$case === 'joinResponse' && object.payload?.joinResponse !== undefined && object.payload?.joinResponse !== null) {
      message.payload = {$case: 'joinResponse', joinResponse: JoinResponse.fromPartial(object.payload.joinResponse)};
    }
    if (object.payload?.$case === 'loginRequest' && object.payload?.loginRequest !== undefined && object.payload?.loginRequest !== null) {
      message.payload = {$case: 'loginRequest', loginRequest: LoginRequest.fromPartial(object.payload.loginRequest)};
    }
    if (object.payload?.$case === 'loginResponse' && object.payload?.loginResponse !== undefined && object.payload?.loginResponse !== null) {
      message.payload = {$case: 'loginResponse', loginResponse: LoginResponse.fromPartial(object.payload.loginResponse)};
    }
    if (object.payload?.$case === 'roomStateChangePayload' && object.payload?.roomStateChangePayload !== undefined && object.payload?.roomStateChangePayload !== null) {
      message.payload = {$case: 'roomStateChangePayload', roomStateChangePayload: RoomStateChangePayload.fromPartial(object.payload.roomStateChangePayload)};
    }
    return message;
  },
  toJSON(message: Payload): unknown {
    const obj: any = {};
    message.payload?.$case === 'chatPayload' && (obj.chatPayload = message.payload?.chatPayload ? ChatPayload.toJSON(message.payload?.chatPayload) : undefined);
    message.payload?.$case === 'broadcastPayload' && (obj.broadcastPayload = message.payload?.broadcastPayload ? BroadcastPayload.toJSON(message.payload?.broadcastPayload) : undefined);
    message.payload?.$case === 'createRoomRequest' && (obj.createRoomRequest = message.payload?.createRoomRequest ? CreateRoomRequest.toJSON(message.payload?.createRoomRequest) : undefined);
    message.payload?.$case === 'createRoomResponse' && (obj.createRoomResponse = message.payload?.createRoomResponse ? CreateRoomResponse.toJSON(message.payload?.createRoomResponse) : undefined);
    message.payload?.$case === 'errorPayload' && (obj.errorPayload = message.payload?.errorPayload ? ErrorPayload.toJSON(message.payload?.errorPayload) : undefined);
    message.payload?.$case === 'getLobbyStateResponse' && (obj.getLobbyStateResponse = message.payload?.getLobbyStateResponse ? GetLobbyStateResponse.toJSON(message.payload?.getLobbyStateResponse) : undefined);
    message.payload?.$case === 'getRoomStateResponse' && (obj.getRoomStateResponse = message.payload?.getRoomStateResponse ? GetRoomStateResponse.toJSON(message.payload?.getRoomStateResponse) : undefined);
    message.payload?.$case === 'joinRequest' && (obj.joinRequest = message.payload?.joinRequest ? JoinRequest.toJSON(message.payload?.joinRequest) : undefined);
    message.payload?.$case === 'joinResponse' && (obj.joinResponse = message.payload?.joinResponse ? JoinResponse.toJSON(message.payload?.joinResponse) : undefined);
    message.payload?.$case === 'loginRequest' && (obj.loginRequest = message.payload?.loginRequest ? LoginRequest.toJSON(message.payload?.loginRequest) : undefined);
    message.payload?.$case === 'loginResponse' && (obj.loginResponse = message.payload?.loginResponse ? LoginResponse.toJSON(message.payload?.loginResponse) : undefined);
    message.payload?.$case === 'roomStateChangePayload' && (obj.roomStateChangePayload = message.payload?.roomStateChangePayload ? RoomStateChangePayload.toJSON(message.payload?.roomStateChangePayload) : undefined);
    return obj;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string }
  ? { [K in keyof Omit<T, '$case'>]?: DeepPartial<T[K]> } & { $case: T['$case'] }
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;