import { packet, packet_type, payload, status, system_action_type } from '@prisel/protos';
import type { NotUndefined, SelectOneOf } from './oneof';

export type Packet = packet.Packet;

export type OneofPayload<Key extends string> = SelectOneOf<Key, payload.Payload['payload']>;

export type PayloadKey = NotUndefined<payload.Payload['payload']['oneofKind']>;

function isPacketType(t: any): t is packet_type.PacketType {
    return (
        t === packet_type.PacketType.DEFAULT ||
        t === packet_type.PacketType.REQUEST ||
        t === packet_type.PacketType.RESPONSE
    );
}

function isPacket(p: any): p is packet.Packet {
    if (!p) {
        return false;
    }
    const packet: Packet = p;
    return typeof packet === 'object' && isPacketType(packet.type);
}

export class PacketBuilder {
    message: 'systemAction' | 'action';
    systemAction: system_action_type.SystemActionType;
    action: string;
    payload?: payload.Payload;

    public static forSystemAction(action: system_action_type.SystemActionType) {
        const builder = new PacketBuilder();
        builder.message = 'systemAction';
        builder.systemAction = action;
        return builder;
    }

    public static forAction(action: string) {
        const builder = new PacketBuilder();
        builder.message = 'action';
        builder.action = action;
        return builder;
    }

    public setPayload<T extends PayloadKey>(payloadType: T, payload: OneofPayload<T>): this {
        this.payload = ({
            payload: {
                oneofKind: payloadType,
                [payloadType]: payload,
            },
        } as unknown) as payload.Payload;
        return this;
    }

    public build(): packet.Packet {
        const result: packet.Packet = {
            type: packet_type.PacketType.DEFAULT,
            message:
                this.message === 'systemAction'
                    ? {
                          oneofKind: 'systemAction',
                          systemAction: this.systemAction,
                      }
                    : {
                          oneofKind: 'action',
                          action: this.action,
                      },
        };
        if (this.payload) {
            result.payload = this.payload;
        }
        return result;
    }
}

export function isValidRequest(p: Packet | undefined) {
    return p?.type === packet_type.PacketType.REQUEST && p?.requestId !== undefined;
}

export function isValidResponse(p: Packet | undefined) {
    return (
        p?.type === packet_type.PacketType.RESPONSE &&
        p?.requestId !== undefined &&
        p?.status !== undefined
    );
}

export const Packet = {
    forSystemAction(action: system_action_type.SystemActionType) {
        return PacketBuilder.forSystemAction(action);
    },
    forAction(action: string) {
        return PacketBuilder.forAction(action);
    },
    getSystemAction(packet: Packet | undefined) {
        if (packet?.message?.oneofKind === 'systemAction') {
            return packet.message.systemAction;
        }
        return undefined;
    },
    getAction(packet: Packet | undefined) {
        if (packet?.message?.oneofKind === 'action') {
            return packet.message.action;
        }
        return undefined;
    },
    isAnySystemAction(
        packet: Packet | undefined,
    ): packet is Packet & {
        message: { oneofKind: 'systemAction'; systemAction: system_action_type.SystemActionType };
    } {
        return (
            packet?.message?.oneofKind === 'systemAction' &&
            packet.message.systemAction != undefined
        );
    },
    isSystemAction<T extends system_action_type.SystemActionType>(
        packet: Packet | undefined,
        systemActionType: T,
    ): packet is Packet & {
        message: { oneofKind: 'systemAction'; systemAction: T };
    } {
        return (
            packet?.message?.oneofKind === 'systemAction' &&
            packet?.message?.systemAction === systemActionType
        );
    },
    isAnyCustomAction(
        packet: Packet | undefined,
    ): packet is Packet & {
        message: { oneofKind: 'action'; action: string };
    } {
        return packet?.message?.oneofKind === 'action' && packet.message.action != undefined;
    },
    isCustomAction<T extends string>(
        packet: Packet | undefined,
        action: T,
    ): packet is Packet & {
        message: { oneofKind: 'action'; action: T };
    } {
        return packet?.message?.oneofKind === 'action' && packet?.message?.action === action;
    },
    hasPayload<T extends PayloadKey>(
        packet: Packet | undefined,
        payloadKey: T,
    ): packet is Packet & { payload: { payload: { oneofKind: T } } } {
        if (
            packet?.payload?.payload?.oneofKind === payloadKey &&
            (packet.payload.payload as any)[payloadKey] !== undefined
        ) {
            return true;
        }
        return false;
    },
    getPayload<T extends PayloadKey>(
        packet: Packet | undefined,
        payloadKey: T,
    ): OneofPayload<T> | undefined {
        if (packet?.payload?.payload?.oneofKind === payloadKey) {
            const payload = packet.payload.payload;
            if (payloadKey in payload) {
                return (payload as any)[payloadKey];
            }
        }
        return undefined;
    },
    isStatusOk(packet: Packet | undefined) {
        return packet?.status?.code === status.Status_Code.OK;
    },
    isStatusFailed(packet: Packet | undefined) {
        return packet?.status?.code === status.Status_Code.FAILED;
    },
    getStatusMessage(packet: Packet | undefined) {
        return packet?.status?.message ?? '';
    },
    getStatusDetail(packet: Packet | undefined) {
        return packet?.status?.detail ?? '';
    },
    /**
     * Verify that packet is well-formed
     * @param packet a potential packet
     */
    verify(packet: any): packet is Packet {
        if (!isPacket(packet)) {
            return false;
        }
        if (isValidRequest(packet) || isValidResponse(packet)) {
            return true;
        }

        return packet.type === packet_type.PacketType.DEFAULT;
    },
    toDebugString(p: Packet): string {
        return JSON.stringify(packet.Packet.toJson(p));
    },
    serialize(pkt: Packet): Uint8Array {
        return packet.Packet.toBinary(pkt);
    },
    deserialize(buffer: any): Packet | undefined {
        if (buffer instanceof ArrayBuffer) {
            return packet.Packet.fromBinary(new Uint8Array(buffer));
        } else if (buffer instanceof Uint8Array) {
            return packet.Packet.fromBinary(buffer);
        }
    },
};
