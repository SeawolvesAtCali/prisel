// @generated by protobuf-ts 2.1.0 with parameter force_client_none
// @generated from protobuf file "prisel/packet.proto" (package "prisel", syntax proto3)
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
import { Payload } from "./payload";
import { Status } from "./status";
import { SystemActionType } from "./system_action_type";
import { PacketType } from "./packet_type";
/**
 * @generated from protobuf message prisel.Packet
 */
export interface Packet {
    /**
     * @generated from protobuf field: prisel.PacketType type = 1;
     */
    type: PacketType;
    /**
     * @generated from protobuf oneof: message
     */
    message: {
        oneofKind: "systemAction";
        /**
         * @generated from protobuf field: prisel.SystemActionType system_action = 2;
         */
        systemAction: SystemActionType;
    } | {
        oneofKind: "action";
        /**
         * @generated from protobuf field: string action = 3;
         */
        action: string;
    } | {
        oneofKind: undefined;
    };
    /**
     * @generated from protobuf field: optional string request_id = 4;
     */
    requestId?: string;
    /**
     * @generated from protobuf field: optional prisel.Status status = 5;
     */
    status?: Status;
    /**
     * @generated from protobuf field: optional prisel.Payload payload = 6;
     */
    payload?: Payload;
}
// @generated message type with reflection information, may provide speed optimized methods
class Packet$Type extends MessageType<Packet> {
    constructor() {
        super("prisel.Packet", [
            { no: 1, name: "type", kind: "enum", T: () => ["prisel.PacketType", PacketType] },
            { no: 2, name: "system_action", kind: "enum", oneof: "message", T: () => ["prisel.SystemActionType", SystemActionType] },
            { no: 3, name: "action", kind: "scalar", oneof: "message", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "request_id", kind: "scalar", opt: true, T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "status", kind: "message", T: () => Status },
            { no: 6, name: "payload", kind: "message", T: () => Payload }
        ]);
    }
    create(value?: PartialMessage<Packet>): Packet {
        const message = { type: 0, message: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<Packet>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: Packet): Packet {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* prisel.PacketType type */ 1:
                    message.type = reader.int32();
                    break;
                case /* prisel.SystemActionType system_action */ 2:
                    message.message = {
                        oneofKind: "systemAction",
                        systemAction: reader.int32()
                    };
                    break;
                case /* string action */ 3:
                    message.message = {
                        oneofKind: "action",
                        action: reader.string()
                    };
                    break;
                case /* optional string request_id */ 4:
                    message.requestId = reader.string();
                    break;
                case /* optional prisel.Status status */ 5:
                    message.status = Status.internalBinaryRead(reader, reader.uint32(), options, message.status);
                    break;
                case /* optional prisel.Payload payload */ 6:
                    message.payload = Payload.internalBinaryRead(reader, reader.uint32(), options, message.payload);
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
    internalBinaryWrite(message: Packet, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* prisel.PacketType type = 1; */
        if (message.type !== 0)
            writer.tag(1, WireType.Varint).int32(message.type);
        /* prisel.SystemActionType system_action = 2; */
        if (message.message.oneofKind === "systemAction")
            writer.tag(2, WireType.Varint).int32(message.message.systemAction);
        /* string action = 3; */
        if (message.message.oneofKind === "action")
            writer.tag(3, WireType.LengthDelimited).string(message.message.action);
        /* optional string request_id = 4; */
        if (message.requestId !== undefined)
            writer.tag(4, WireType.LengthDelimited).string(message.requestId);
        /* optional prisel.Status status = 5; */
        if (message.status)
            Status.internalBinaryWrite(message.status, writer.tag(5, WireType.LengthDelimited).fork(), options).join();
        /* optional prisel.Payload payload = 6; */
        if (message.payload)
            Payload.internalBinaryWrite(message.payload, writer.tag(6, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message prisel.Packet
 */
export const Packet = new Packet$Type();
