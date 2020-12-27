/* eslint-disable */
import { Writer, Reader } from 'protobufjs/minimal';


export interface ChatPayload {
  message: string;
}

const baseChatPayload: object = {
  message: "",
};

export const protobufPackage = 'prisel'

export const ChatPayload = {
  encode(message: ChatPayload, writer: Writer = Writer.create()): Writer {
    writer.uint32(10).string(message.message);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): ChatPayload {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseChatPayload } as ChatPayload;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ChatPayload {
    const message = { ...baseChatPayload } as ChatPayload;
    if (object.message !== undefined && object.message !== null) {
      message.message = String(object.message);
    }
    return message;
  },
  fromPartial(object: DeepPartial<ChatPayload>): ChatPayload {
    const message = { ...baseChatPayload } as ChatPayload;
    if (object.message !== undefined && object.message !== null) {
      message.message = object.message;
    }
    return message;
  },
  toJSON(message: ChatPayload): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
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