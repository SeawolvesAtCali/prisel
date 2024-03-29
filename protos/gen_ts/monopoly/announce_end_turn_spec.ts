// @generated by protobuf-ts 2.1.0 with parameter force_client_none
// @generated from protobuf file "monopoly/announce_end_turn_spec.proto" (package "monopoly", syntax proto3)
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
 * type : "announce_end_turn"
 * packet_type : DEFAULT
 *
 * @generated from protobuf message monopoly.AnnounceEndTurnPayload
 */
export interface AnnounceEndTurnPayload {
    /**
     * @generated from protobuf field: string current_player = 1;
     */
    currentPlayer: string;
    /**
     * @generated from protobuf field: string next_player = 2;
     */
    nextPlayer: string;
}
// @generated message type with reflection information, may provide speed optimized methods
class AnnounceEndTurnPayload$Type extends MessageType<AnnounceEndTurnPayload> {
    constructor() {
        super("monopoly.AnnounceEndTurnPayload", [
            { no: 1, name: "current_player", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "next_player", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<AnnounceEndTurnPayload>): AnnounceEndTurnPayload {
        const message = { currentPlayer: "", nextPlayer: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<AnnounceEndTurnPayload>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: AnnounceEndTurnPayload): AnnounceEndTurnPayload {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string current_player */ 1:
                    message.currentPlayer = reader.string();
                    break;
                case /* string next_player */ 2:
                    message.nextPlayer = reader.string();
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
    internalBinaryWrite(message: AnnounceEndTurnPayload, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string current_player = 1; */
        if (message.currentPlayer !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.currentPlayer);
        /* string next_player = 2; */
        if (message.nextPlayer !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.nextPlayer);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message monopoly.AnnounceEndTurnPayload
 */
export const AnnounceEndTurnPayload = new AnnounceEndTurnPayload$Type();
