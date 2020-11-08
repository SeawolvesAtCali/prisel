import { Reader, Writer } from 'protobufjs/minimal';

export interface ProtoGenInstance<T> {
    typeUrl: string;
    encode: (message: T, writer: Writer) => Writer;
    decode: (input: Uint8Array | Reader, length?: number) => T;
}
