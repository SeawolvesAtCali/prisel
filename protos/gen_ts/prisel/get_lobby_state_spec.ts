/* eslint-disable */
import { RoomInfo } from '../prisel/room_info';
import { Writer, Reader } from 'protobufjs/minimal';


export interface GetLobbyStateResponse {
  rooms: GetLobbyStateResponse_LobbyRoomViewInfo[];
}

export interface GetLobbyStateResponse_LobbyRoomViewInfo {
  room: RoomInfo | undefined;
  playerCount: number;
  maxPlayers: number;
}

const baseGetLobbyStateResponse: object = {
};

const baseGetLobbyStateResponse_LobbyRoomViewInfo: object = {
  playerCount: 0,
  maxPlayers: 0,
};

export const GetLobbyStateResponse = {
  typeUrl: 'type.googleapis.com/prisel.GetLobbyStateResponse',
  encode(message: GetLobbyStateResponse, writer: Writer = Writer.create()): Writer {
    for (const v of message.rooms) {
      GetLobbyStateResponse_LobbyRoomViewInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): GetLobbyStateResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseGetLobbyStateResponse } as GetLobbyStateResponse;
    message.rooms = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.rooms.push(GetLobbyStateResponse_LobbyRoomViewInfo.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GetLobbyStateResponse {
    const message = { ...baseGetLobbyStateResponse } as GetLobbyStateResponse;
    message.rooms = [];
    if (object.rooms !== undefined && object.rooms !== null) {
      for (const e of object.rooms) {
        message.rooms.push(GetLobbyStateResponse_LobbyRoomViewInfo.fromJSON(e));
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<GetLobbyStateResponse>): GetLobbyStateResponse {
    const message = { ...baseGetLobbyStateResponse } as GetLobbyStateResponse;
    message.rooms = [];
    if (object.rooms !== undefined && object.rooms !== null) {
      for (const e of object.rooms) {
        message.rooms.push(GetLobbyStateResponse_LobbyRoomViewInfo.fromPartial(e));
      }
    }
    return message;
  },
  toJSON(message: GetLobbyStateResponse): unknown {
    const obj: any = {};
    if (message.rooms) {
      obj.rooms = message.rooms.map(e => e ? GetLobbyStateResponse_LobbyRoomViewInfo.toJSON(e) : undefined);
    } else {
      obj.rooms = [];
    }
    return obj;
  },
};

export const GetLobbyStateResponse_LobbyRoomViewInfo = {
  typeUrl: 'type.googleapis.com/prisel.GetLobbyStateResponse_LobbyRoomViewInfo',
  encode(message: GetLobbyStateResponse_LobbyRoomViewInfo, writer: Writer = Writer.create()): Writer {
    if (message.room !== undefined && message.room !== undefined) {
      RoomInfo.encode(message.room, writer.uint32(10).fork()).ldelim();
    }
    writer.uint32(16).int32(message.playerCount);
    writer.uint32(24).int32(message.maxPlayers);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): GetLobbyStateResponse_LobbyRoomViewInfo {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseGetLobbyStateResponse_LobbyRoomViewInfo } as GetLobbyStateResponse_LobbyRoomViewInfo;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.room = RoomInfo.decode(reader, reader.uint32());
          break;
        case 2:
          message.playerCount = reader.int32();
          break;
        case 3:
          message.maxPlayers = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GetLobbyStateResponse_LobbyRoomViewInfo {
    const message = { ...baseGetLobbyStateResponse_LobbyRoomViewInfo } as GetLobbyStateResponse_LobbyRoomViewInfo;
    if (object.room !== undefined && object.room !== null) {
      message.room = RoomInfo.fromJSON(object.room);
    }
    if (object.playerCount !== undefined && object.playerCount !== null) {
      message.playerCount = Number(object.playerCount);
    }
    if (object.maxPlayers !== undefined && object.maxPlayers !== null) {
      message.maxPlayers = Number(object.maxPlayers);
    }
    return message;
  },
  fromPartial(object: DeepPartial<GetLobbyStateResponse_LobbyRoomViewInfo>): GetLobbyStateResponse_LobbyRoomViewInfo {
    const message = { ...baseGetLobbyStateResponse_LobbyRoomViewInfo } as GetLobbyStateResponse_LobbyRoomViewInfo;
    if (object.room !== undefined && object.room !== null) {
      message.room = RoomInfo.fromPartial(object.room);
    }
    if (object.playerCount !== undefined && object.playerCount !== null) {
      message.playerCount = object.playerCount;
    }
    if (object.maxPlayers !== undefined && object.maxPlayers !== null) {
      message.maxPlayers = object.maxPlayers;
    }
    return message;
  },
  toJSON(message: GetLobbyStateResponse_LobbyRoomViewInfo): unknown {
    const obj: any = {};
    message.room !== undefined && (obj.room = message.room ? RoomInfo.toJSON(message.room) : undefined);
    message.playerCount !== undefined && (obj.playerCount = message.playerCount);
    message.maxPlayers !== undefined && (obj.maxPlayers = message.maxPlayers);
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