import { Any } from '@prisel/protos';
import { Reader, Writer } from 'protobufjs/minimal';

export const AnyUtils = {
    pack,
    unpack,
};

function pack<T>(
    message: T,
    protoClass: { typeUrl: string; encode: (message: T, writer?: Writer) => Writer },
): Any {
    return {
        typeUrl: protoClass.typeUrl,
        value: protoClass.encode(message).finish(),
    };
}

function unpack<T>(
    any: Any,
    protoClass: { typeUrl: string; decode: (input: Uint8Array | Reader) => T },
): T | undefined {
    if (protoClass.typeUrl === any.typeUrl) {
        return protoClass.decode(Reader.create(any.value));
    }
}
