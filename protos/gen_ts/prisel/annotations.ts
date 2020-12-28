/* eslint-disable */
import { SystemActionType, systemActionTypeFromJSON, systemActionTypeToJSON } from '../prisel/system_action_type';
import { PacketType, packetTypeFromJSON, packetTypeToJSON } from '../prisel/packet_type';
import { Writer, Reader } from 'protobufjs/minimal';


export interface SystemActionSpec {
  type: SystemActionType;
  packetType: PacketType;
}

export interface ActionSpec {
  type: string;
  packetType: PacketType;
}

const baseSystemActionSpec: object = {
  type: 0,
  packetType: 0,
};

const baseActionSpec: object = {
  type: "",
  packetType: 0,
};

export const protobufPackage = 'prisel'

export const SystemActionSpec = {
  encode(message: SystemActionSpec, writer: Writer = Writer.create()): Writer {
    writer.uint32(8).int32(message.type);
    writer.uint32(16).int32(message.packetType);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): SystemActionSpec {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseSystemActionSpec } as SystemActionSpec;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.int32() as any;
          break;
        case 2:
          message.packetType = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): SystemActionSpec {
    const message = { ...baseSystemActionSpec } as SystemActionSpec;
    if (object.type !== undefined && object.type !== null) {
      message.type = systemActionTypeFromJSON(object.type);
    }
    if (object.packetType !== undefined && object.packetType !== null) {
      message.packetType = packetTypeFromJSON(object.packetType);
    }
    return message;
  },
  fromPartial(object: DeepPartial<SystemActionSpec>): SystemActionSpec {
    const message = { ...baseSystemActionSpec } as SystemActionSpec;
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type;
    }
    if (object.packetType !== undefined && object.packetType !== null) {
      message.packetType = object.packetType;
    }
    return message;
  },
  toJSON(message: SystemActionSpec): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = systemActionTypeToJSON(message.type));
    message.packetType !== undefined && (obj.packetType = packetTypeToJSON(message.packetType));
    return obj;
  },
};

export const ActionSpec = {
  encode(message: ActionSpec, writer: Writer = Writer.create()): Writer {
    writer.uint32(10).string(message.type);
    writer.uint32(16).int32(message.packetType);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): ActionSpec {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseActionSpec } as ActionSpec;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.string();
          break;
        case 2:
          message.packetType = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ActionSpec {
    const message = { ...baseActionSpec } as ActionSpec;
    if (object.type !== undefined && object.type !== null) {
      message.type = String(object.type);
    }
    if (object.packetType !== undefined && object.packetType !== null) {
      message.packetType = packetTypeFromJSON(object.packetType);
    }
    return message;
  },
  fromPartial(object: DeepPartial<ActionSpec>): ActionSpec {
    const message = { ...baseActionSpec } as ActionSpec;
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type;
    }
    if (object.packetType !== undefined && object.packetType !== null) {
      message.packetType = object.packetType;
    }
    return message;
  },
  toJSON(message: ActionSpec): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = message.type);
    message.packetType !== undefined && (obj.packetType = packetTypeToJSON(message.packetType));
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