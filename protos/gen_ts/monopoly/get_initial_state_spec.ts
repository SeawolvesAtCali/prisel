// @generated by protobuf-ts 2.1.0 with parameter force_client_none
// @generated from protobuf file "monopoly/get_initial_state_spec.proto" (package "monopoly", syntax proto3)
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
import { GamePlayer } from "./game_player";
/**
 * type : "get_initial_state"
 * packet_type : RESPONSE
 *
 * @generated from protobuf message monopoly.GetInitialStateResponse
 */
export interface GetInitialStateResponse {
    /**
     * @generated from protobuf field: repeated monopoly.GamePlayer players = 1;
     */
    players: GamePlayer[];
    /**
     * @generated from protobuf field: string first_player_id = 2;
     */
    firstPlayerId: string;
}
// @generated message type with reflection information, may provide speed optimized methods
class GetInitialStateResponse$Type extends MessageType<GetInitialStateResponse> {
    constructor() {
        super("monopoly.GetInitialStateResponse", [
            { no: 1, name: "players", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => GamePlayer },
            { no: 2, name: "first_player_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<GetInitialStateResponse>): GetInitialStateResponse {
        const message = { players: [], firstPlayerId: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial<GetInitialStateResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: GetInitialStateResponse): GetInitialStateResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* repeated monopoly.GamePlayer players */ 1:
                    message.players.push(GamePlayer.internalBinaryRead(reader, reader.uint32(), options));
                    break;
                case /* string first_player_id */ 2:
                    message.firstPlayerId = reader.string();
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
    internalBinaryWrite(message: GetInitialStateResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* repeated monopoly.GamePlayer players = 1; */
        for (let i = 0; i < message.players.length; i++)
            GamePlayer.internalBinaryWrite(message.players[i], writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* string first_player_id = 2; */
        if (message.firstPlayerId !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.firstPlayerId);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message monopoly.GetInitialStateResponse
 */
export const GetInitialStateResponse = new GetInitialStateResponse$Type();
