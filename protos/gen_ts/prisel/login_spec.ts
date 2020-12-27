/* eslint-disable */
import { Writer, Reader } from 'protobufjs/minimal';


export interface LoginRequest {
  username: string;
}

export interface LoginResponse {
  userId: string;
}

const baseLoginRequest: object = {
  username: "",
};

const baseLoginResponse: object = {
  userId: "",
};

export const protobufPackage = 'prisel'

export const LoginRequest = {
  encode(message: LoginRequest, writer: Writer = Writer.create()): Writer {
    writer.uint32(10).string(message.username);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): LoginRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseLoginRequest } as LoginRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.username = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): LoginRequest {
    const message = { ...baseLoginRequest } as LoginRequest;
    if (object.username !== undefined && object.username !== null) {
      message.username = String(object.username);
    }
    return message;
  },
  fromPartial(object: DeepPartial<LoginRequest>): LoginRequest {
    const message = { ...baseLoginRequest } as LoginRequest;
    if (object.username !== undefined && object.username !== null) {
      message.username = object.username;
    }
    return message;
  },
  toJSON(message: LoginRequest): unknown {
    const obj: any = {};
    message.username !== undefined && (obj.username = message.username);
    return obj;
  },
};

export const LoginResponse = {
  encode(message: LoginResponse, writer: Writer = Writer.create()): Writer {
    writer.uint32(10).string(message.userId);
    return writer;
  },
  decode(input: Uint8Array | Reader, length?: number): LoginResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseLoginResponse } as LoginResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): LoginResponse {
    const message = { ...baseLoginResponse } as LoginResponse;
    if (object.userId !== undefined && object.userId !== null) {
      message.userId = String(object.userId);
    }
    return message;
  },
  fromPartial(object: DeepPartial<LoginResponse>): LoginResponse {
    const message = { ...baseLoginResponse } as LoginResponse;
    if (object.userId !== undefined && object.userId !== null) {
      message.userId = object.userId;
    }
    return message;
  },
  toJSON(message: LoginResponse): unknown {
    const obj: any = {};
    message.userId !== undefined && (obj.userId = message.userId);
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