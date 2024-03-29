// @generated by protobuf-ts 2.1.0 with parameter force_client_none
// @generated from protobuf file "monopoly/coordinate.proto" (package "monopoly", syntax proto3)
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
 * The position of an entity on the board
 *
 * @generated from protobuf message monopoly.Coordinate
 */
export interface Coordinate {
    /**
     * @generated from protobuf field: int32 row = 1;
     */
    row: number;
    /**
     * @generated from protobuf field: int32 col = 2;
     */
    col: number;
}
// @generated message type with reflection information, may provide speed optimized methods
class Coordinate$Type extends MessageType<Coordinate> {
    constructor() {
        super("monopoly.Coordinate", [
            { no: 1, name: "row", kind: "scalar", T: 5 /*ScalarType.INT32*/ },
            { no: 2, name: "col", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
    create(value?: PartialMessage<Coordinate>): Coordinate {
        const message = { row: 0, col: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Coordinate>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Coordinate): Coordinate {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* int32 row */ 1:
                    message.row = reader.int32();
                    break;
                case /* int32 col */ 2:
                    message.col = reader.int32();
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
    internalBinaryWrite(message: Coordinate, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* int32 row = 1; */
        if (message.row !== 0)
            writer.tag(1, WireType.Varint).int32(message.row);
        /* int32 col = 2; */
        if (message.col !== 0)
            writer.tag(2, WireType.Varint).int32(message.col);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message monopoly.Coordinate
 */
export const Coordinate = new Coordinate$Type();
