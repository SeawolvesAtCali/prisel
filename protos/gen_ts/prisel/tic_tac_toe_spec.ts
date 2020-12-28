/* eslint-disable */
import { Writer, Reader } from 'protobufjs/minimal';


export interface MovePayload {
  position: number;
}

export interface GameStatePayload {
  player: string[];
  map: string[];
  currentPlayer: number;
  winner?: string | undefined;
}

const baseMovePayload: object = {
  position: 0,
};

const baseGameStatePayload: object = {
  player: "",
  map: "",
  currentPlayer: 0,
};

export const protobufPackage = 'tic_tac_toe'

export const MovePayload = {
  encode(message: MovePayload, writer: Writer = Writer.create()): Writer {
    writer.uint32(8).uint32(message.position);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): MovePayload {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMovePayload } as MovePayload;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.position = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MovePayload {
    const message = { ...baseMovePayload } as MovePayload;
    if (object.position !== undefined && object.position !== null) {
      message.position = Number(object.position);
    }
    return message;
  },
  fromPartial(object: DeepPartial<MovePayload>): MovePayload {
    const message = { ...baseMovePayload } as MovePayload;
    if (object.position !== undefined && object.position !== null) {
      message.position = object.position;
    }
    return message;
  },
  toJSON(message: MovePayload): unknown {
    const obj: any = {};
    message.position !== undefined && (obj.position = message.position);
    return obj;
  },
};

export const GameStatePayload = {
  encode(message: GameStatePayload, writer: Writer = Writer.create()): Writer {
    for (const v of message.player) {
      writer.uint32(10).string(v!);
    }
    for (const v of message.map) {
      writer.uint32(18).string(v!);
    }
    writer.uint32(24).uint32(message.currentPlayer);
    if (message.winner !== undefined) {
      writer.uint32(34).string(message.winner);
    }
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): GameStatePayload {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseGameStatePayload } as GameStatePayload;
    message.player = [];
    message.map = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.player.push(reader.string());
          break;
        case 2:
          message.map.push(reader.string());
          break;
        case 3:
          message.currentPlayer = reader.uint32();
          break;
        case 4:
          message.winner = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): GameStatePayload {
    const message = { ...baseGameStatePayload } as GameStatePayload;
    message.player = [];
    message.map = [];
    if (object.player !== undefined && object.player !== null) {
      for (const e of object.player) {
        message.player.push(String(e));
      }
    }
    if (object.map !== undefined && object.map !== null) {
      for (const e of object.map) {
        message.map.push(String(e));
      }
    }
    if (object.currentPlayer !== undefined && object.currentPlayer !== null) {
      message.currentPlayer = Number(object.currentPlayer);
    }
    if (object.winner !== undefined && object.winner !== null) {
      message.winner = String(object.winner);
    }
    return message;
  },
  fromPartial(object: DeepPartial<GameStatePayload>): GameStatePayload {
    const message = { ...baseGameStatePayload } as GameStatePayload;
    message.player = [];
    message.map = [];
    if (object.player !== undefined && object.player !== null) {
      for (const e of object.player) {
        message.player.push(e);
      }
    }
    if (object.map !== undefined && object.map !== null) {
      for (const e of object.map) {
        message.map.push(e);
      }
    }
    if (object.currentPlayer !== undefined && object.currentPlayer !== null) {
      message.currentPlayer = object.currentPlayer;
    }
    if (object.winner !== undefined && object.winner !== null) {
      message.winner = object.winner;
    }
    return message;
  },
  toJSON(message: GameStatePayload): unknown {
    const obj: any = {};
    if (message.player) {
      obj.player = message.player.map(e => e);
    } else {
      obj.player = [];
    }
    if (message.map) {
      obj.map = message.map.map(e => e);
    } else {
      obj.map = [];
    }
    message.currentPlayer !== undefined && (obj.currentPlayer = message.currentPlayer);
    message.winner !== undefined && (obj.winner = message.winner);
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