// @generated by protobuf-ts 1.0.12 with parameters disable_service_client
// @generated from protobuf file "monopoly/announce_purchase_spec.proto" (package "monopoly", syntax proto3)
// tslint:disable
import { BinaryWriteOptions } from "@protobuf-ts/runtime";
import { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import { BinaryReadOptions } from "@protobuf-ts/runtime";
import { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { PropertyInfo } from "./property";
/**
 * type : "announce_purchase"
 * packet_type : DEFAULT
 *
 * @generated from protobuf message monopoly.AnnouncePurchasePayload
 */
export interface AnnouncePurchasePayload {
    /**
     * @generated from protobuf field: string player = 1;
     */
    player: string;
    /**
     * @generated from protobuf field: monopoly.PropertyInfo property = 2;
     */
    property?: PropertyInfo;
}
/**
 * Type for protobuf message monopoly.AnnouncePurchasePayload
 */
class AnnouncePurchasePayload$Type extends MessageType<AnnouncePurchasePayload> {
    constructor() {
        super("monopoly.AnnouncePurchasePayload", [
            { no: 1, name: "player", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "property", kind: "message", T: () => PropertyInfo }
        ]);
    }
    create(value?: PartialMessage<AnnouncePurchasePayload>): AnnouncePurchasePayload {
        const message = { player: "" };
        if (value !== undefined)
            reflectionMergePartial<AnnouncePurchasePayload>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AnnouncePurchasePayload): AnnouncePurchasePayload {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string player */ 1:
                    message.player = reader.string();
                    break;
                case /* monopoly.PropertyInfo property */ 2:
                    message.property = PropertyInfo.internalBinaryRead(reader, reader.uint32(), options, message.property);
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
    internalBinaryWrite(message: AnnouncePurchasePayload, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string player = 1; */
        if (message.player !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.player);
        /* monopoly.PropertyInfo property = 2; */
        if (message.property)
            PropertyInfo.internalBinaryWrite(message.property, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
export const AnnouncePurchasePayload = new AnnouncePurchasePayload$Type();
