/* eslint-disable */
import { PacketType, packetTypeFromJSON, packetTypeToJSON } from '../prisel/packet_type';
import { SystemActionType, systemActionTypeFromJSON, systemActionTypeToJSON } from '../prisel/system_action_type';
import { Any } from '../google/protobuf/any';
import { Status } from '../prisel/status';
import { Writer, Reader } from 'protobufjs/minimal';


export interface Packet {
  type: PacketType;
  message?: { $case: 'systemAction', systemAction: SystemActionType } | { $case: 'action', action: Any };
  requestId?: string | undefined;
  status?: Status | undefined;
  payload?: Any | undefined;
}

const basePacket: object = {
  type: 0,
};

export const Packet = {
  typeUrl: 'type.googleapis.com/prisel.Packet',
  encode(message: Packet, writer: Writer = Writer.create()): Writer {
    writer.uint32(8).int32(message.type);
    if (message.message?.$case === 'systemAction') {
      writer.uint32(16).int32(message.message.systemAction);
    }
    if (message.message?.$case === 'action') {
      Any.encode(message.message.action, writer.uint32(26).fork()).ldelim();
    }
    if (message.requestId !== undefined) {
      writer.uint32(34).string(message.requestId);
    }
    if (message.status !== undefined) {
      Status.encode(message.status, writer.uint32(42).fork()).ldelim();
    }
    if (message.payload !== undefined) {
      Any.encode(message.payload, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): Packet {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...basePacket } as Packet;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.int32() as any;
          break;
        case 2:
          message.message = {$case: 'systemAction', systemAction: reader.int32() as any};
          break;
        case 3:
          message.message = {$case: 'action', action: Any.decode(reader, reader.uint32())};
          break;
        case 4:
          message.requestId = reader.string();
          break;
        case 5:
          message.status = Status.decode(reader, reader.uint32());
          break;
        case 6:
          message.payload = Any.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Packet {
    const message = { ...basePacket } as Packet;
    if (object.type !== undefined && object.type !== null) {
      message.type = packetTypeFromJSON(object.type);
    }
    if (object.systemAction !== undefined && object.systemAction !== null) {
      message.message = {$case: 'systemAction', systemAction: systemActionTypeFromJSON(object.systemAction)};
    }
    if (object.action !== undefined && object.action !== null) {
      message.message = {$case: 'action', action: Any.fromJSON(object.action)};
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = String(object.requestId);
    }
    if (object.status !== undefined && object.status !== null) {
      message.status = Status.fromJSON(object.status);
    }
    if (object.payload !== undefined && object.payload !== null) {
      message.payload = Any.fromJSON(object.payload);
    }
    return message;
  },
  fromPartial(object: DeepPartial<Packet>): Packet {
    const message = { ...basePacket } as Packet;
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type;
    }
    if (object.message?.$case === 'systemAction' && object.message?.systemAction !== undefined && object.message?.systemAction !== null) {
      message.message = {$case: 'systemAction', systemAction: object.message.systemAction};
    }
    if (object.message?.$case === 'action' && object.message?.action !== undefined && object.message?.action !== null) {
      message.message = {$case: 'action', action: Any.fromPartial(object.message.action)};
    }
    if (object.requestId !== undefined && object.requestId !== null) {
      message.requestId = object.requestId;
    }
    if (object.status !== undefined && object.status !== null) {
      message.status = Status.fromPartial(object.status);
    }
    if (object.payload !== undefined && object.payload !== null) {
      message.payload = Any.fromPartial(object.payload);
    }
    return message;
  },
  toJSON(message: Packet): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = packetTypeToJSON(message.type));
    message.message?.$case === 'systemAction' && (obj.systemAction = message.message?.systemAction !== undefined ? systemActionTypeToJSON(message.message?.systemAction) : undefined);
    message.message?.$case === 'action' && (obj.action = message.message?.action ? Any.toJSON(message.message?.action) : undefined);
    message.requestId !== undefined && (obj.requestId = message.requestId);
    message.status !== undefined && (obj.status = message.status ? Status.toJSON(message.status) : undefined);
    message.payload !== undefined && (obj.payload = message.payload ? Any.toJSON(message.payload) : undefined);
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