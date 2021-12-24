// @generated by protobuf-ts 2.1.0 with parameter force_client_none
// @generated from protobuf file "monopoly/tile_effect.proto" (package "monopoly", syntax proto3)
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
import { DetainedExtra } from "./detained_extra";
import { CollectibleExtra } from "./collectible_extra";
import { MoveStepsExtra } from "./move_steps_extra";
import { MoneyExchangeExtra } from "./money_exchange_extra";
import { MoveToTileExtra } from "./move_to_tile_extra";
/**
 * TileEffect is effect that player will take when entering/leaving/stoping at a
 * tile.
 *
 * @generated from protobuf message monopoly.TileEffectDisplay
 */
export interface TileEffectDisplay {
    /**
     * @generated from protobuf field: string title = 1;
     */
    title: string;
    /**
     * @generated from protobuf field: string description = 2;
     */
    description: string;
}
/**
 * @generated from protobuf message monopoly.TileEffect
 */
export interface TileEffect {
    /**
     * @generated from protobuf field: monopoly.TileEffectDisplay display = 1;
     */
    display?: TileEffectDisplay;
    /**
     * @generated from protobuf field: monopoly.TileEffect.Timing timing = 2;
     */
    timing: TileEffect_Timing;
    /**
     * @generated from protobuf oneof: extra
     */
    extra: {
        oneofKind: "unspecified";
        /**
         * @generated from protobuf field: bool unspecified = 3;
         */
        unspecified: boolean;
    } | {
        oneofKind: "moveToTile";
        /**
         * @generated from protobuf field: monopoly.MoveToTileExtra move_to_tile = 4;
         */
        moveToTile: MoveToTileExtra;
    } | {
        oneofKind: "moneyExchange";
        /**
         * @generated from protobuf field: monopoly.MoneyExchangeExtra money_exchange = 5;
         */
        moneyExchange: MoneyExchangeExtra;
    } | {
        oneofKind: "moveSteps";
        /**
         * @generated from protobuf field: monopoly.MoveStepsExtra move_steps = 6;
         */
        moveSteps: MoveStepsExtra;
    } | {
        oneofKind: "collectible";
        /**
         * @generated from protobuf field: monopoly.CollectibleExtra collectible = 7;
         */
        collectible: CollectibleExtra;
    } | {
        oneofKind: "detained";
        /**
         * @generated from protobuf field: monopoly.DetainedExtra detained = 8;
         */
        detained: DetainedExtra;
    } | {
        oneofKind: undefined;
    };
}
/**
 * @generated from protobuf enum monopoly.TileEffect.Timing
 */
export enum TileEffect_Timing {
    /**
     * @generated from protobuf enum value: UNSPECIFIED = 0;
     */
    UNSPECIFIED = 0,
    /**
     * Effect activates when entering the tile. Even if player would stop at
     * this tile, the effect activates before any user actions at this tile (pay
     * rent, purchase land, etc.)
     *
     * @generated from protobuf enum value: ENTERING = 1;
     */
    ENTERING = 1,
    /**
     * Effect activates when stopping at the tile. The effect activates before
     * any user actions at this tile (pay rent, purchase land, etc.)
     *
     * @generated from protobuf enum value: STOPPING = 2;
     */
    STOPPING = 2,
    /**
     * Effect activates when leaving this tile. Either before player starts
     * moving on a new turn, or when player passing this tile.
     *
     * @generated from protobuf enum value: LEAVING = 3;
     */
    LEAVING = 3
}
// @generated message type with reflection information, may provide speed optimized methods
class TileEffectDisplay$Type extends MessageType<TileEffectDisplay> {
    constructor() {
        super("monopoly.TileEffectDisplay", [
            { no: 1, name: "title", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "description", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<TileEffectDisplay>): TileEffectDisplay {
        const message = { title: "", description: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<TileEffectDisplay>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TileEffectDisplay): TileEffectDisplay {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string title */ 1:
                    message.title = reader.string();
                    break;
                case /* string description */ 2:
                    message.description = reader.string();
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
    internalBinaryWrite(message: TileEffectDisplay, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* string title = 1; */
        if (message.title !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.title);
        /* string description = 2; */
        if (message.description !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.description);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message monopoly.TileEffectDisplay
 */
export const TileEffectDisplay = new TileEffectDisplay$Type();
// @generated message type with reflection information, may provide speed optimized methods
class TileEffect$Type extends MessageType<TileEffect> {
    constructor() {
        super("monopoly.TileEffect", [
            { no: 1, name: "display", kind: "message", T: () => TileEffectDisplay },
            { no: 2, name: "timing", kind: "enum", T: () => ["monopoly.TileEffect.Timing", TileEffect_Timing] },
            { no: 3, name: "unspecified", kind: "scalar", oneof: "extra", T: 8 /*ScalarType.BOOL*/ },
            { no: 4, name: "move_to_tile", kind: "message", oneof: "extra", T: () => MoveToTileExtra },
            { no: 5, name: "money_exchange", kind: "message", oneof: "extra", T: () => MoneyExchangeExtra },
            { no: 6, name: "move_steps", kind: "message", oneof: "extra", T: () => MoveStepsExtra },
            { no: 7, name: "collectible", kind: "message", oneof: "extra", T: () => CollectibleExtra },
            { no: 8, name: "detained", kind: "message", oneof: "extra", T: () => DetainedExtra }
        ]);
    }
    create(value?: PartialMessage<TileEffect>): TileEffect {
        const message = { timing: 0, extra: { oneofKind: undefined } };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<TileEffect>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: TileEffect): TileEffect {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* monopoly.TileEffectDisplay display */ 1:
                    message.display = TileEffectDisplay.internalBinaryRead(reader, reader.uint32(), options, message.display);
                    break;
                case /* monopoly.TileEffect.Timing timing */ 2:
                    message.timing = reader.int32();
                    break;
                case /* bool unspecified */ 3:
                    message.extra = {
                        oneofKind: "unspecified",
                        unspecified: reader.bool()
                    };
                    break;
                case /* monopoly.MoveToTileExtra move_to_tile */ 4:
                    message.extra = {
                        oneofKind: "moveToTile",
                        moveToTile: MoveToTileExtra.internalBinaryRead(reader, reader.uint32(), options, (message.extra as any).moveToTile)
                    };
                    break;
                case /* monopoly.MoneyExchangeExtra money_exchange */ 5:
                    message.extra = {
                        oneofKind: "moneyExchange",
                        moneyExchange: MoneyExchangeExtra.internalBinaryRead(reader, reader.uint32(), options, (message.extra as any).moneyExchange)
                    };
                    break;
                case /* monopoly.MoveStepsExtra move_steps */ 6:
                    message.extra = {
                        oneofKind: "moveSteps",
                        moveSteps: MoveStepsExtra.internalBinaryRead(reader, reader.uint32(), options, (message.extra as any).moveSteps)
                    };
                    break;
                case /* monopoly.CollectibleExtra collectible */ 7:
                    message.extra = {
                        oneofKind: "collectible",
                        collectible: CollectibleExtra.internalBinaryRead(reader, reader.uint32(), options, (message.extra as any).collectible)
                    };
                    break;
                case /* monopoly.DetainedExtra detained */ 8:
                    message.extra = {
                        oneofKind: "detained",
                        detained: DetainedExtra.internalBinaryRead(reader, reader.uint32(), options, (message.extra as any).detained)
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
    internalBinaryWrite(message: TileEffect, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* monopoly.TileEffectDisplay display = 1; */
        if (message.display)
            TileEffectDisplay.internalBinaryWrite(message.display, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* monopoly.TileEffect.Timing timing = 2; */
        if (message.timing !== 0)
            writer.tag(2, WireType.Varint).int32(message.timing);
        /* bool unspecified = 3; */
        if (message.extra.oneofKind === "unspecified")
            writer.tag(3, WireType.Varint).bool(message.extra.unspecified);
        /* monopoly.MoveToTileExtra move_to_tile = 4; */
        if (message.extra.oneofKind === "moveToTile")
            MoveToTileExtra.internalBinaryWrite(message.extra.moveToTile, writer.tag(4, WireType.LengthDelimited).fork(), options).join();
        /* monopoly.MoneyExchangeExtra money_exchange = 5; */
        if (message.extra.oneofKind === "moneyExchange")
            MoneyExchangeExtra.internalBinaryWrite(message.extra.moneyExchange, writer.tag(5, WireType.LengthDelimited).fork(), options).join();
        /* monopoly.MoveStepsExtra move_steps = 6; */
        if (message.extra.oneofKind === "moveSteps")
            MoveStepsExtra.internalBinaryWrite(message.extra.moveSteps, writer.tag(6, WireType.LengthDelimited).fork(), options).join();
        /* monopoly.CollectibleExtra collectible = 7; */
        if (message.extra.oneofKind === "collectible")
            CollectibleExtra.internalBinaryWrite(message.extra.collectible, writer.tag(7, WireType.LengthDelimited).fork(), options).join();
        /* monopoly.DetainedExtra detained = 8; */
        if (message.extra.oneofKind === "detained")
            DetainedExtra.internalBinaryWrite(message.extra.detained, writer.tag(8, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message monopoly.TileEffect
 */
export const TileEffect = new TileEffect$Type();
