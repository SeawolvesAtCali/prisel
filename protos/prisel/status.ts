/* eslint-disable */
import { Writer, Reader } from 'protobufjs/minimal';


export interface Status {
  code: Status_Code;
  message: string;
}

const baseStatus: object = {
  code: 0,
  message: "",
};

export const protobufPackage = 'prisel'

export enum Status_Code {
  UNSPECIFIED = 0,
  OK = 1,
  FAILED = 2,
  UNRECOGNIZED = -1,
}

export function status_CodeFromJSON(object: any): Status_Code {
  switch (object) {
    case 0:
    case "UNSPECIFIED":
      return Status_Code.UNSPECIFIED;
    case 1:
    case "OK":
      return Status_Code.OK;
    case 2:
    case "FAILED":
      return Status_Code.FAILED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Status_Code.UNRECOGNIZED;
  }
}

export function status_CodeToJSON(object: Status_Code): string {
  switch (object) {
    case Status_Code.UNSPECIFIED:
      return "UNSPECIFIED";
    case Status_Code.OK:
      return "OK";
    case Status_Code.FAILED:
      return "FAILED";
    default:
      return "UNKNOWN";
  }
}

export const Status = {
  encode(message: Status, writer: Writer = Writer.create()): Writer {
    writer.uint32(8).int32(message.code);
    writer.uint32(18).string(message.message);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): Status {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseStatus } as Status;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.code = reader.int32() as any;
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
  fromJSON(object: any): Status {
    const message = { ...baseStatus } as Status;
    if (object.code !== undefined && object.code !== null) {
      message.code = status_CodeFromJSON(object.code);
    }
    if (object.message !== undefined && object.message !== null) {
      message.message = String(object.message);
    }
    return message;
  },
  fromPartial(object: DeepPartial<Status>): Status {
    const message = { ...baseStatus } as Status;
    if (object.code !== undefined && object.code !== null) {
      message.code = object.code;
    }
    if (object.message !== undefined && object.message !== null) {
      message.message = object.message;
    }
    return message;
  },
  toJSON(message: Status): unknown {
    const obj: any = {};
    message.code !== undefined && (obj.code = status_CodeToJSON(message.code));
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