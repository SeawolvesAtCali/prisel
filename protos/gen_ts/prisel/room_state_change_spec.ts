/* eslint-disable */
import { PlayerInfo } from '../prisel/player_info';
import { UpdateToken } from '../prisel/update_token';
import { Writer, Reader } from 'protobufjs/minimal';


export interface RoomStateChangePayload {
  change?: { $case: 'playerJoin', playerJoin: PlayerInfo } | { $case: 'playerLeave', playerLeave: string } | { $case: 'hostLeave', hostLeave: RoomStateChangePayload_HostLeaveData };
  token: UpdateToken | undefined;
}

export interface RoomStateChangePayload_HostLeaveData {
  hostId: string;
  newHostId: string;
}

const baseRoomStateChangePayload: object = {
};

const baseRoomStateChangePayload_HostLeaveData: object = {
  hostId: "",
  newHostId: "",
};

export const protobufPackage = 'prisel'

export const RoomStateChangePayload = {
  encode(message: RoomStateChangePayload, writer: Writer = Writer.create()): Writer {
    if (message.change?.$case === 'playerJoin') {
      PlayerInfo.encode(message.change.playerJoin, writer.uint32(10).fork()).ldelim();
    }
    if (message.change?.$case === 'playerLeave') {
      writer.uint32(18).string(message.change.playerLeave);
    }
    if (message.change?.$case === 'hostLeave') {
      RoomStateChangePayload_HostLeaveData.encode(message.change.hostLeave, writer.uint32(26).fork()).ldelim();
    }
    if (message.token !== undefined && message.token !== undefined) {
      UpdateToken.encode(message.token, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): RoomStateChangePayload {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseRoomStateChangePayload } as RoomStateChangePayload;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.change = {$case: 'playerJoin', playerJoin: PlayerInfo.decode(reader, reader.uint32())};
          break;
        case 2:
          message.change = {$case: 'playerLeave', playerLeave: reader.string()};
          break;
        case 3:
          message.change = {$case: 'hostLeave', hostLeave: RoomStateChangePayload_HostLeaveData.decode(reader, reader.uint32())};
          break;
        case 4:
          message.token = UpdateToken.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): RoomStateChangePayload {
    const message = { ...baseRoomStateChangePayload } as RoomStateChangePayload;
    if (object.playerJoin !== undefined && object.playerJoin !== null) {
      message.change = {$case: 'playerJoin', playerJoin: PlayerInfo.fromJSON(object.playerJoin)};
    }
    if (object.playerLeave !== undefined && object.playerLeave !== null) {
      message.change = {$case: 'playerLeave', playerLeave: String(object.playerLeave)};
    }
    if (object.hostLeave !== undefined && object.hostLeave !== null) {
      message.change = {$case: 'hostLeave', hostLeave: RoomStateChangePayload_HostLeaveData.fromJSON(object.hostLeave)};
    }
    if (object.token !== undefined && object.token !== null) {
      message.token = UpdateToken.fromJSON(object.token);
    }
    return message;
  },
  fromPartial(object: DeepPartial<RoomStateChangePayload>): RoomStateChangePayload {
    const message = { ...baseRoomStateChangePayload } as RoomStateChangePayload;
    if (object.change?.$case === 'playerJoin' && object.change?.playerJoin !== undefined && object.change?.playerJoin !== null) {
      message.change = {$case: 'playerJoin', playerJoin: PlayerInfo.fromPartial(object.change.playerJoin)};
    }
    if (object.change?.$case === 'playerLeave' && object.change?.playerLeave !== undefined && object.change?.playerLeave !== null) {
      message.change = {$case: 'playerLeave', playerLeave: object.change.playerLeave};
    }
    if (object.change?.$case === 'hostLeave' && object.change?.hostLeave !== undefined && object.change?.hostLeave !== null) {
      message.change = {$case: 'hostLeave', hostLeave: RoomStateChangePayload_HostLeaveData.fromPartial(object.change.hostLeave)};
    }
    if (object.token !== undefined && object.token !== null) {
      message.token = UpdateToken.fromPartial(object.token);
    }
    return message;
  },
  toJSON(message: RoomStateChangePayload): unknown {
    const obj: any = {};
    message.change?.$case === 'playerJoin' && (obj.playerJoin = message.change?.playerJoin ? PlayerInfo.toJSON(message.change?.playerJoin) : undefined);
    message.change?.$case === 'playerLeave' && (obj.playerLeave = message.change?.playerLeave);
    message.change?.$case === 'hostLeave' && (obj.hostLeave = message.change?.hostLeave ? RoomStateChangePayload_HostLeaveData.toJSON(message.change?.hostLeave) : undefined);
    message.token !== undefined && (obj.token = message.token ? UpdateToken.toJSON(message.token) : undefined);
    return obj;
  },
};

export const RoomStateChangePayload_HostLeaveData = {
  encode(message: RoomStateChangePayload_HostLeaveData, writer: Writer = Writer.create()): Writer {
    writer.uint32(10).string(message.hostId);
    writer.uint32(18).string(message.newHostId);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): RoomStateChangePayload_HostLeaveData {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseRoomStateChangePayload_HostLeaveData } as RoomStateChangePayload_HostLeaveData;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hostId = reader.string();
          break;
        case 2:
          message.newHostId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): RoomStateChangePayload_HostLeaveData {
    const message = { ...baseRoomStateChangePayload_HostLeaveData } as RoomStateChangePayload_HostLeaveData;
    if (object.hostId !== undefined && object.hostId !== null) {
      message.hostId = String(object.hostId);
    }
    if (object.newHostId !== undefined && object.newHostId !== null) {
      message.newHostId = String(object.newHostId);
    }
    return message;
  },
  fromPartial(object: DeepPartial<RoomStateChangePayload_HostLeaveData>): RoomStateChangePayload_HostLeaveData {
    const message = { ...baseRoomStateChangePayload_HostLeaveData } as RoomStateChangePayload_HostLeaveData;
    if (object.hostId !== undefined && object.hostId !== null) {
      message.hostId = object.hostId;
    }
    if (object.newHostId !== undefined && object.newHostId !== null) {
      message.newHostId = object.newHostId;
    }
    return message;
  },
  toJSON(message: RoomStateChangePayload_HostLeaveData): unknown {
    const obj: any = {};
    message.hostId !== undefined && (obj.hostId = message.hostId);
    message.newHostId !== undefined && (obj.newHostId = message.newHostId);
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