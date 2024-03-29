// @generated by protobuf-ts 2.1.0 with parameter force_client_none
// @generated from protobuf file "monopoly/prompt_purchase_spec.proto" (package "monopoly", syntax proto3)
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
import { PropertyLevel } from "./property";
import { PropertyInfo } from "./property";
/**
 * type : "prompt_purchase"
 * packet_type : REQUEST
 *
 * @generated from protobuf message monopoly.PromptPurchaseRequest
 */
export interface PromptPurchaseRequest {
    /**
     * @generated from protobuf field: monopoly.PropertyInfo property = 1;
     */
    property?: PropertyInfo;
    /**
     * @generated from protobuf field: repeated monopoly.PropertyLevel levels = 2;
     */
    levels: PropertyLevel[];
    /**
     * Whether this property can be upgraded right now. Only purchased
     * land/property that has not reached the upgrade limit can be upgraded.
     *
     * @generated from protobuf field: bool is_upgrade = 7;
     */
    isUpgrade: boolean;
    /**
     * @generated from protobuf field: int32 money_after_purchase = 8;
     */
    moneyAfterPurchase: number;
}
/**
 * type : "prompt_purchase"
 * packet_type : REQUEST
 *
 * @generated from protobuf message monopoly.PromptPurchaseResponse
 */
export interface PromptPurchaseResponse {
    /**
     * @generated from protobuf field: bool purchased = 1;
     */
    purchased: boolean;
}
// @generated message type with reflection information, may provide speed optimized methods
class PromptPurchaseRequest$Type extends MessageType<PromptPurchaseRequest> {
    constructor() {
        super("monopoly.PromptPurchaseRequest", [
            { no: 1, name: "property", kind: "message", T: () => PropertyInfo },
            { no: 2, name: "levels", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => PropertyLevel },
            { no: 7, name: "is_upgrade", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 8, name: "money_after_purchase", kind: "scalar", T: 5 /*ScalarType.INT32*/ }
        ]);
    }
    create(value?: PartialMessage<PromptPurchaseRequest>): PromptPurchaseRequest {
        const message = { levels: [], isUpgrade: false, moneyAfterPurchase: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PromptPurchaseRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PromptPurchaseRequest): PromptPurchaseRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* monopoly.PropertyInfo property */ 1:
                    message.property = PropertyInfo.internalBinaryRead(reader, reader.uint32(), options, message.property);
                    break;
                case /* repeated monopoly.PropertyLevel levels */ 2:
                    message.levels.push(PropertyLevel.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* bool is_upgrade */ 7:
                    message.isUpgrade = reader.bool();
                    break;
                case /* int32 money_after_purchase */ 8:
                    message.moneyAfterPurchase = reader.int32();
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
    internalBinaryWrite(message: PromptPurchaseRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* monopoly.PropertyInfo property = 1; */
        if (message.property)
            PropertyInfo.internalBinaryWrite(message.property, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* repeated monopoly.PropertyLevel levels = 2; */
        for (let i = 0; i < message.levels.length; i++)
            PropertyLevel.internalBinaryWrite(message.levels[i], writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* bool is_upgrade = 7; */
        if (message.isUpgrade !== false)
            writer.tag(7, WireType.Varint).bool(message.isUpgrade);
        /* int32 money_after_purchase = 8; */
        if (message.moneyAfterPurchase !== 0)
            writer.tag(8, WireType.Varint).int32(message.moneyAfterPurchase);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message monopoly.PromptPurchaseRequest
 */
export const PromptPurchaseRequest = new PromptPurchaseRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PromptPurchaseResponse$Type extends MessageType<PromptPurchaseResponse> {
    constructor() {
        super("monopoly.PromptPurchaseResponse", [
            { no: 1, name: "purchased", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
    create(value?: PartialMessage<PromptPurchaseResponse>): PromptPurchaseResponse {
        const message = { purchased: false };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<PromptPurchaseResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: PromptPurchaseResponse): PromptPurchaseResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* bool purchased */ 1:
                    message.purchased = reader.bool();
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
    internalBinaryWrite(message: PromptPurchaseResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* bool purchased = 1; */
        if (message.purchased !== false)
            writer.tag(1, WireType.Varint).bool(message.purchased);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message monopoly.PromptPurchaseResponse
 */
export const PromptPurchaseResponse = new PromptPurchaseResponse$Type();
