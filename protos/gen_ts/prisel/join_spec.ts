/* eslint-disable */
import { RoomInfo } from '../prisel/room_info';
import { RoomStateSnapshot } from '../prisel/room_state_snapshot';
import { Writer, Reader } from 'protobufjs/minimal';


export interface JoinRequest {
  roomId: string;
}

export interface JoinResponse {
  room: RoomInfo | undefined;
  roomState: RoomStateSnapshot | undefined;
}

const baseJoinRequest: object = {
  roomId: "",
};

const baseJoinResponse: object = {
};

export const protobufPackage = 'prisel'

export const JoinRequest = {
  encode(message: JoinRequest, writer: Writer = Writer.create()): Writer {
    writer.uint32(10).string(message.roomId);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): JoinRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseJoinRequest } as JoinRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.roomId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): JoinRequest {
    const message = { ...baseJoinRequest } as JoinRequest;
    if (object.roomId !== undefined && object.roomId !== null) {
      message.roomId = String(object.roomId);
    }
    return message;
  },
  fromPartial(object: DeepPartial<JoinRequest>): JoinRequest {
    const message = { ...baseJoinRequest } as JoinRequest;
    if (object.roomId !== undefined && object.roomId !== null) {
      message.roomId = object.roomId;
    }
    return message;
  },
  toJSON(message: JoinRequest): unknown {
    const obj: any = {};
    message.roomId !== undefined && (obj.roomId = message.roomId);
    return obj;
  },
};

export const JoinResponse = {
  encode(message: JoinResponse, writer: Writer = Writer.create()): Writer {
    if (message.room !== undefined && message.room !== undefined) {
      RoomInfo.encode(message.room, writer.uint32(10).fork()).ldelim();
    }
    if (message.roomState !== undefined && message.roomState !== undefined) {
      RoomStateSnapshot.encode(message.roomState, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): JoinResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseJoinResponse } as JoinResponse;
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
  fromJSON(object: any): JoinResponse {
    const message = { ...baseJoinResponse } as JoinResponse;
    if (object.room !== undefined && object.room !== null) {
      message.room = RoomInfo.fromJSON(object.room);
    }
    if (object.roomState !== undefined && object.roomState !== null) {
      message.roomState = RoomStateSnapshot.fromJSON(object.roomState);
    }
    return message;
  },
  fromPartial(object: DeepPartial<JoinResponse>): JoinResponse {
    const message = { ...baseJoinResponse } as JoinResponse;
    if (object.room !== undefined && object.room !== null) {
      message.room = RoomInfo.fromPartial(object.room);
    }
    if (object.roomState !== undefined && object.roomState !== null) {
      message.roomState = RoomStateSnapshot.fromPartial(object.roomState);
    }
    return message;
  },
  toJSON(message: JoinResponse): unknown {
    const obj: any = {};
    message.room !== undefined && (obj.room = message.room ? RoomInfo.toJSON(message.room) : undefined);
    message.roomState !== undefined && (obj.roomState = message.roomState ? RoomStateSnapshot.toJSON(message.roomState) : undefined);
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