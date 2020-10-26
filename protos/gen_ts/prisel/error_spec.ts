/* eslint-disable */
import { Writer, Reader } from 'protobufjs/minimal';


export interface ErrorPayload {
  message: string;
  detail: string;
}

const baseErrorPayload: object = {
  message: "",
  detail: "",
};

export const ErrorPayload = {
  typeUrl: 'type.googleapis.com/prisel.ErrorPayload',
  encode(message: ErrorPayload, writer: Writer = Writer.create()): Writer {
    writer.uint32(10).string(message.message);
    writer.uint32(18).string(message.detail);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): ErrorPayload {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseErrorPayload } as ErrorPayload;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;
        case 2:
          message.detail = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): ErrorPayload {
    const message = { ...baseErrorPayload } as ErrorPayload;
    if (object.message !== undefined && object.message !== null) {
      message.message = String(object.message);
    }
    if (object.detail !== undefined && object.detail !== null) {
      message.detail = String(object.detail);
    }
    return message;
  },
  fromPartial(object: DeepPartial<ErrorPayload>): ErrorPayload {
    const message = { ...baseErrorPayload } as ErrorPayload;
    if (object.message !== undefined && object.message !== null) {
      message.message = object.message;
    }
    if (object.detail !== undefined && object.detail !== null) {
      message.detail = object.detail;
    }
    return message;
  },
  toJSON(message: ErrorPayload): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    message.detail !== undefined && (obj.detail = message.detail);
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