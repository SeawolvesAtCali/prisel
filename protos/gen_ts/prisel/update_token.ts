/* eslint-disable */
import { Writer, Reader } from 'protobufjs/minimal';


/**
 *  Token is used to prevent lost packets. When client receives a new
 *  UpdateToken, they should compare if the previousToken matches the current
 *  token saved in the client, if so, no packet was dropped, and they should
 *  update the saved token to be the new token.
 */
export interface UpdateToken {
  previousToken: string;
  token: string;
}

const baseUpdateToken: object = {
  previousToken: "",
  token: "",
};

export const UpdateToken = {
  typeUrl: 'type.googleapis.com/prisel.UpdateToken',
  encode(message: UpdateToken, writer: Writer = Writer.create()): Writer {
    writer.uint32(10).string(message.previousToken);
    writer.uint32(18).string(message.token);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): UpdateToken {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseUpdateToken } as UpdateToken;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.previousToken = reader.string();
          break;
        case 2:
          message.token = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): UpdateToken {
    const message = { ...baseUpdateToken } as UpdateToken;
    if (object.previousToken !== undefined && object.previousToken !== null) {
      message.previousToken = String(object.previousToken);
    }
    if (object.token !== undefined && object.token !== null) {
      message.token = String(object.token);
    }
    return message;
  },
  fromPartial(object: DeepPartial<UpdateToken>): UpdateToken {
    const message = { ...baseUpdateToken } as UpdateToken;
    if (object.previousToken !== undefined && object.previousToken !== null) {
      message.previousToken = object.previousToken;
    }
    if (object.token !== undefined && object.token !== null) {
      message.token = object.token;
    }
    return message;
  },
  toJSON(message: UpdateToken): unknown {
    const obj: any = {};
    message.previousToken !== undefined && (obj.previousToken = message.previousToken);
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