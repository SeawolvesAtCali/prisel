// @generated by protobuf-ts 2.1.0 with parameter force_client_none
// @generated from protobuf file "prisel/join_spec.proto" (package "prisel", syntax proto3)
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
import { RoomStateSnapshot } from "./room_state_snapshot";
import { RoomInfo } from "./room_info";
/**
 * type : JOIN,
 * packet_type : REQUEST
 *
 * @generated from protobuf message prisel.JoinRequest
 */
export interface JoinRequest {
    /**
     * @generated from protobuf oneof: room
     */
    room: {
        oneofKind: "roomId";
        /**
         * @generated from protobuf field: string roomId = 1;
         */
        roomId: string;
    } | {
        oneofKind: "defaultRoom";
        /**
         * @generated from protobuf field: bool defaultRoom = 2;
         */
        defaultRoom: boolean;
    } | {
        oneofKind: undefined;
    };
}
/**
 * type : JOIN,
 * packet_type : RESPONSE
 *
 * @generated from protobuf message prisel.JoinResponse
 */
export interface JoinResponse {
    /**
     * @generated from protobuf field: prisel.RoomInfo room = 1;
     */
    room?: RoomInfo;
    /**
     * @generated from protobuf field: prisel.RoomStateSnapshot roomState = 2;
     */
    roomState?: RoomStateSnapshot;
}
// @generated message type with reflection information, may provide speed optimized methods
class JoinRequest$Type extends MessageType<JoinRequest> {
    constructor() {
        super("prisel.JoinRequest", [
            { no: 1, name: "roomId", kind: "scalar", oneof: "room", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "defaultRoom", kind: "scalar", oneof: "room", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value?: PartialMessage<JoinRequest>): JoinRequest {
        const message = { room: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<JoinRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: JoinRequest): JoinRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string roomId */ 1:
                    message.room = {
                        oneofKind: "roomId",
                        roomId: reader.string()
                    };
                    break;
                case /* bool defaultRoom */ 2:
                    message.room = {
                        oneofKind: "defaultRoom",
                        defaultRoom: reader.bool()
                    };
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
    internalBinaryWrite(message: JoinRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string roomId = 1; */
        if (message.room.oneofKind === "roomId")
            writer.tag(1, WireType.LengthDelimited).string(message.room.roomId);
        /* bool defaultRoom = 2; */
        if (message.room.oneofKind === "defaultRoom")
            writer.tag(2, WireType.Varint).bool(message.room.defaultRoom);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message prisel.JoinRequest
 */
export const JoinRequest = new JoinRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class JoinResponse$Type extends MessageType<JoinResponse> {
    constructor() {
        super("prisel.JoinResponse", [
            { no: 1, name: "room", kind: "message", T: () => RoomInfo },
            { no: 2, name: "roomState", kind: "message", T: () => RoomStateSnapshot }
        ]);
    }
    create(value?: PartialMessage<JoinResponse>): JoinResponse {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<JoinResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: JoinResponse): JoinResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* prisel.RoomInfo room */ 1:
                    message.room = RoomInfo.internalBinaryRead(reader, reader.uint32(), options, message.room);
                    break;
                case /* prisel.RoomStateSnapshot roomState */ 2:
                    message.roomState = RoomStateSnapshot.internalBinaryRead(reader, reader.uint32(), options, message.roomState);
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
    internalBinaryWrite(message: JoinResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* prisel.RoomInfo room = 1; */
        if (message.room)
            RoomInfo.internalBinaryWrite(message.room, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* prisel.RoomStateSnapshot roomState = 2; */
        if (message.roomState)
            RoomStateSnapshot.internalBinaryWrite(message.roomState, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message prisel.JoinResponse
 */
export const JoinResponse = new JoinResponse$Type();
