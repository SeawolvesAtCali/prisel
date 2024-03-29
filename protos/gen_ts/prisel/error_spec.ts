// @generated by protobuf-ts 2.1.0 with parameter force_client_none
// @generated from protobuf file "prisel/error_spec.proto" (package "prisel", syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * type : ERROR,
 * packet_type : DEFAULT
 *
 * @generated from protobuf message prisel.ErrorPayload
 */
export interface ErrorPayload {
    /**
     * @generated from protobuf field: string message = 1;
     */
    message: string;
    /**
     * @generated from protobuf field: optional string detail = 2;
     */
    detail?: string;
}
// @generated message type with reflection information, may provide speed optimized methods
class ErrorPayload$Type extends MessageType<ErrorPayload> {
    constructor() {
        super("prisel.ErrorPayload", [
            { no: 1, name: "message", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "detail", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<ErrorPayload>): ErrorPayload {
        const message = { message: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<ErrorPayload>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: ErrorPayload): ErrorPayload {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string message */ 1:
                    message.message = reader.string();
                    break;
                case /* optional string detail */ 2:
                    message.detail = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: ErrorPayload, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string message = 1; */
        if (message.message !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.message);
        /* optional string detail = 2; */
        if (message.detail !== undefined)
            writer.tag(2, WireType.LengthDelimited).string(message.detail);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message prisel.ErrorPayload
 */
export const ErrorPayload = new ErrorPayload$Type();
