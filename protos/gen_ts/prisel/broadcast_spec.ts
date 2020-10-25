/* eslint-disable */
import { PlayerInfo } from '../prisel/player_info';
import { Writer, Reader } from 'protobufjs/minimal';


export interface BroadcastPayload {
  player: PlayerInfo | undefined;
  message: string;
}

const baseBroadcastPayload: object = {
  message: "",
};

export const BroadcastPayload = {
  typeUrl: 'type.googleapis.com/prisel.BroadcastPayload',
  encode(message: BroadcastPayload, writer: Writer = Writer.create()): Writer {
    if (message.player !== undefined && message.player !== undefined) {
      PlayerInfo.encode(message.player, writer.uint32(10).fork()).ldelim();
    }
    writer.uint32(18).string(message.message);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): BroadcastPayload {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseBroadcastPayload } as BroadcastPayload;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.player = PlayerInfo.decode(reader, reader.uint32());
          break;
        case 2:
          message.message = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): BroadcastPayload {
    const message = { ...baseBroadcastPayload } as BroadcastPayload;
    if (object.player !== undefined && object.player !== null) {
      message.player = PlayerInfo.fromJSON(object.player);
    }
    if (object.message !== undefined && object.message !== null) {
      message.message = String(object.message);
    }
    return message;
  },
  fromPartial(object: DeepPartial<BroadcastPayload>): BroadcastPayload {
    const message = { ...baseBroadcastPayload } as BroadcastPayload;
    if (object.player !== undefined && object.player !== null) {
      message.player = PlayerInfo.fromPartial(object.player);
    }
    if (object.message !== undefined && object.message !== null) {
      message.message = object.message;
    }
    return message;
  },
  toJSON(message: BroadcastPayload): unknown {
    const obj: any = {};
    message.player !== undefined && (obj.player = message.player ? PlayerInfo.toJSON(message.player) : undefined);
    message.message !== undefined && (obj.message = message.message);
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