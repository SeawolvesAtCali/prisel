/* eslint-disable */
import { RoomInfo } from '../prisel/room_info';
import { RoomStateSnapshot } from '../prisel/room_state_snapshot';
import { Writer, Reader } from 'protobufjs/minimal';


export interface CreateRoomRequest {
  roomName: string;
}

export interface CreateRoomResponse {
  room: RoomInfo | undefined;
  roomState: RoomStateSnapshot | undefined;
}

const baseCreateRoomRequest: object = {
  roomName: "",
};

const baseCreateRoomResponse: object = {
};

export const CreateRoomRequest = {
  typeUrl: 'type.googleapis.com/prisel.CreateRoomRequest',
  encode(message: CreateRoomRequest, writer: Writer = Writer.create()): Writer {
    writer.uint32(10).string(message.roomName);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): CreateRoomRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseCreateRoomRequest } as CreateRoomRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.roomName = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): CreateRoomRequest {
    const message = { ...baseCreateRoomRequest } as CreateRoomRequest;
    if (object.roomName !== undefined && object.roomName !== null) {
      message.roomName = String(object.roomName);
    }
    return message;
  },
  fromPartial(object: DeepPartial<CreateRoomRequest>): CreateRoomRequest {
    const message = { ...baseCreateRoomRequest } as CreateRoomRequest;
    if (object.roomName !== undefined && object.roomName !== null) {
      message.roomName = object.roomName;
    }
    return message;
  },
  toJSON(message: CreateRoomRequest): unknown {
    const obj: any = {};
    message.roomName !== undefined && (obj.roomName = message.roomName);
    return obj;
  },
};

export const CreateRoomResponse = {
  typeUrl: 'type.googleapis.com/prisel.CreateRoomResponse',
  encode(message: CreateRoomResponse, writer: Writer = Writer.create()): Writer {
    if (message.room !== undefined && message.room !== undefined) {
      RoomInfo.encode(message.room, writer.uint32(10).fork()).ldelim();
    }
    if (message.roomState !== undefined && message.roomState !== undefined) {
      RoomStateSnapshot.encode(message.roomState, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): CreateRoomResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseCreateRoomResponse } as CreateRoomResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.room = RoomInfo.decode(reader, reader.uint32());
          break;
        case 2:
          message.roomState = RoomStateSnapshot.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): CreateRoomResponse {
    const message = { ...baseCreateRoomResponse } as CreateRoomResponse;
    if (object.room !== undefined && object.room !== null) {
      message.room = RoomInfo.fromJSON(object.room);
    }
    if (object.roomState !== undefined && object.roomState !== null) {
      message.roomState = RoomStateSnapshot.fromJSON(object.roomState);
    }
    return message;
  },
  fromPartial(object: DeepPartial<CreateRoomResponse>): CreateRoomResponse {
    const message = { ...baseCreateRoomResponse } as CreateRoomResponse;
    if (object.room !== undefined && object.room !== null) {
      message.room = RoomInfo.fromPartial(object.room);
    }
    if (object.roomState !== undefined && object.roomState !== null) {
      message.roomState = RoomStateSnapshot.fromPartial(object.roomState);
    }
    return message;
  },
  toJSON(message: CreateRoomResponse): unknown {
    const obj: any = {};
    message.room !== undefined && (obj.room = message.room ? RoomInfo.toJSON(message.room) : undefined);
    message.roomState !== undefined && (obj.roomState = message.roomState ? RoomStateSnapshot.toJSON(message.roomState) : undefined);
    return obj;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | undefined;
type DeepPartial<T> = T extends Builtin
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