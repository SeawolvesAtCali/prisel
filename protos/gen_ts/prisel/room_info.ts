/* eslint-disable */
import { Writer, Reader } from 'protobufjs/minimal';


export interface RoomInfo {
  name: string;
  id: string;
}

const baseRoomInfo: object = {
  name: "",
  id: "",
};

export const RoomInfo = {
  typeUrl: 'type.googleapis.com/prisel.RoomInfo',
  encode(message: RoomInfo, writer: Writer = Writer.create()): Writer {
    writer.uint32(10).string(message.name);
    writer.uint32(18).string(message.id);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): RoomInfo {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseRoomInfo } as RoomInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): RoomInfo {
    const message = { ...baseRoomInfo } as RoomInfo;
    if (object.name !== undefined && object.name !== null) {
      message.name = String(object.name);
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = String(object.id);
    }
    return message;
  },
  fromPartial(object: DeepPartial<RoomInfo>): RoomInfo {
    const message = { ...baseRoomInfo } as RoomInfo;
    if (object.name !== undefined && object.name !== null) {
      message.name = object.name;
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = object.id;
    }
    return message;
  },
  toJSON(message: RoomInfo): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.id !== undefined && (obj.id = message.id);
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