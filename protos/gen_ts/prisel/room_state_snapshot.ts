/* eslint-disable */
import { PlayerInfo } from '../prisel/player_info';
import { Writer, Reader } from 'protobufjs/minimal';


export interface RoomStateSnapshot {
  players: PlayerInfo[];
  hostId: string;
  token: string;
}

const baseRoomStateSnapshot: object = {
  hostId: "",
  token: "",
};

export const protobufPackage = 'prisel'

export const RoomStateSnapshot = {
  encode(message: RoomStateSnapshot, writer: Writer = Writer.create()): Writer {
    for (const v of message.players) {
      PlayerInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    writer.uint32(18).string(message.hostId);
    writer.uint32(26).string(message.token);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): RoomStateSnapshot {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseRoomStateSnapshot } as RoomStateSnapshot;
    message.players = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.players.push(PlayerInfo.decode(reader, reader.uint32()));
          break;
        case 2:
          message.hostId = reader.string();
          break;
        case 3:
          message.token = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): RoomStateSnapshot {
    const message = { ...baseRoomStateSnapshot } as RoomStateSnapshot;
    message.players = [];
    if (object.players !== undefined && object.players !== null) {
      for (const e of object.players) {
        message.players.push(PlayerInfo.fromJSON(e));
      }
    }
    if (object.hostId !== undefined && object.hostId !== null) {
      message.hostId = String(object.hostId);
    }
    if (object.token !== undefined && object.token !== null) {
      message.token = String(object.token);
    }
    return message;
  },
  fromPartial(object: DeepPartial<RoomStateSnapshot>): RoomStateSnapshot {
    const message = { ...baseRoomStateSnapshot } as RoomStateSnapshot;
    message.players = [];
    if (object.players !== undefined && object.players !== null) {
      for (const e of object.players) {
        message.players.push(PlayerInfo.fromPartial(e));
      }
    }
    if (object.hostId !== undefined && object.hostId !== null) {
      message.hostId = object.hostId;
    }
    if (object.token !== undefined && object.token !== null) {
      message.token = object.token;
    }
    return message;
  },
  toJSON(message: RoomStateSnapshot): unknown {
    const obj: any = {};
    if (message.players) {
      obj.players = message.players.map(e => e ? PlayerInfo.toJSON(e) : undefined);
    } else {
      obj.players = [];
    }
    message.hostId !== undefined && (obj.hostId = message.hostId);
    message.token !== undefined && (obj.token = message.token);
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