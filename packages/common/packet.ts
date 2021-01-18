import { priselpb, protobuf } from '@prisel/protos';
import { IMessageType } from '@protobuf-ts/runtime';
import type { SelectOneOf } from './oneof';
import { typeRegistry } from './typeRegistry';

export type Packet = priselpb.Packet;

export type OneofPayload<Key extends string> = SelectOneOf<Key, priselpb.Payload['payload']>;

export type PayloadKey = Exclude<
    priselpb.Payload['payload']['oneofKind'],
    undefined | 'actionPayload'
>;
export class PacketBuilder {
    message: 'systemAction' | 'action' = 'action';
    systemAction: priselpb.SystemActionType = priselpb.SystemActionType.UNSPECIFIED;
    action: string = 'unspecified';
    payload?: priselpb.Payload;

    public static forSystemAction(action: priselpb.SystemActionType) {
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

    public setPayload<T extends PayloadKey>(payloadType: T, payload: OneofPayload<T>): this;
    public setPayload<T extends object>(messageType: IMessageType<T>, payload: T): this;
    setPayload(payloadTypeOrMessageType: PayloadKey | IMessageType<any>, payload: any): this {
        if (typeof payloadTypeOrMessageType === 'string') {
            this.payload = ({
                payload: {
                    oneofKind: payloadTypeOrMessageType,
                    [payloadTypeOrMessageType]: payload,
                },
            } as unknown) as priselpb.Payload;
            return this;
        }
        this.payload = {
            payload: {
                oneofKind: 'actionPayload',
                actionPayload: protobuf.any.Any.pack(payload, payloadTypeOrMessageType),
            },
        };
        return this;
    }

    public build(): priselpb.Packet {
        const result: priselpb.Packet = {
            type: priselpb.PacketType.DEFAULT,
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
    return p?.type === priselpb.PacketType.REQUEST && p?.requestId !== undefined;
}

export function isValidResponse(p: Packet | undefined) {
    return (
        p?.type === priselpb.PacketType.RESPONSE &&
        p?.requestId !== undefined &&
        p?.status !== undefined
    );
}

class Packet$Type {
    public forSystemAction(action: priselpb.SystemActionType) {
        return PacketBuilder.forSystemAction(action);
    }
    public forAction(action: string) {
        return PacketBuilder.forAction(action);
    }
    public getSystemAction(packet: Packet | undefined) {
        if (packet?.message?.oneofKind === 'systemAction') {
            return packet.message.systemAction;
        }
        return undefined;
    }
    public getAction(packet: Packet | undefined) {
        if (packet?.message?.oneofKind === 'action') {
            return packet.message.action;
        }
        return undefined;
    }
    public isAnySystemAction(
        packet: Packet | undefined,
    ): packet is Packet & {
        message: { oneofKind: 'systemAction'; systemAction: priselpb.SystemActionType };
    } {
        return (
            packet?.message?.oneofKind === 'systemAction' &&
            packet.message.systemAction != undefined
        );
    }
    public isSystemAction<T extends priselpb.SystemActionType>(
        packet: Packet | undefined,
        systemActionType: T,
    ): packet is Packet & {
        message: { oneofKind: 'systemAction'; systemAction: T };
    } {
        return (
            packet?.message?.oneofKind === 'systemAction' &&
            packet?.message?.systemAction === systemActionType
        );
    }
    public isAnyCustomAction(
        packet: Packet | undefined,
    ): packet is Packet & {
        message: { oneofKind: 'action'; action: string };
    } {
        return packet?.message?.oneofKind === 'action' && packet.message.action != undefined;
    }
    public isCustomAction<T extends string>(
        packet: Packet | undefined,
        action: T,
    ): packet is Packet & {
        message: { oneofKind: 'action'; action: T };
    } {
        return packet?.message?.oneofKind === 'action' && packet?.message?.action === action;
    }
    public hasPayload<T extends PayloadKey>(packet: Packet | undefined, payloadKey: T): boolean;
    public hasPayload<T extends object>(
        packet: Packet | undefined,
        messageType: IMessageType<T>,
    ): boolean;
    hasPayload(
        packet: Packet | undefined,
        payloadKeyOrMessageType: PayloadKey | IMessageType<any>,
    ) {
        if (!packet) {
            return false;
        }
        if (typeof payloadKeyOrMessageType === 'string') {
            return (
                packet?.payload?.payload?.oneofKind === payloadKeyOrMessageType &&
                (packet.payload.payload as any)[payloadKeyOrMessageType] !== undefined
            );
        }
        if (packet.payload?.payload?.oneofKind === 'actionPayload') {
            return protobuf.any.Any.contains(
                packet.payload.payload.actionPayload,
                payloadKeyOrMessageType,
            );
        }
        return false;
    }
    public getPayload<T extends PayloadKey>(
        packet: Packet | undefined,
        payloadKey: T,
    ): OneofPayload<T> | undefined;
    public getPayload<T extends object>(
        packet: Packet | undefined,
        messageType: IMessageType<T>,
    ): T | undefined;
    getPayload(
        packet: Packet | undefined,
        payloadKeyOrMessageType: PayloadKey | IMessageType<any>,
    ) {
        if (!packet) {
            return undefined;
        }
        if (typeof payloadKeyOrMessageType === 'string') {
            if (packet.payload?.payload?.oneofKind === payloadKeyOrMessageType) {
                const payload = packet.payload.payload;
                if (payloadKeyOrMessageType in payload) {
                    return (payload as any)[payloadKeyOrMessageType];
                }
            }
            return undefined;
        }
        if (
            packet.payload?.payload?.oneofKind === 'actionPayload' &&
            protobuf.any.Any.contains(packet.payload.payload.actionPayload, payloadKeyOrMessageType)
        ) {
            return protobuf.any.Any.unpack(
                packet.payload.payload.actionPayload,
                payloadKeyOrMessageType,
            );
        }
        return undefined;
    }
    public isStatusOk(packet: Packet | undefined) {
        return packet?.status?.code === priselpb.Status_Code.OK;
    }
    public isStatusFailed(packet: Packet | undefined) {
        return packet?.status?.code === priselpb.Status_Code.FAILED;
    }
    public getStatusMessage(packet: Packet | undefined) {
        return packet?.status?.message ?? '';
    }
    public getStatusDetail(packet: Packet | undefined) {
        return packet?.status?.detail ?? '';
    }
    /**
     * Verify that packet is well-formed
     * @param p a potential packet
     */
    public is(p: any): p is Packet {
        return (
            priselpb.Packet.is(p) &&
            (isValidRequest(p) || isValidResponse(p) || p.type === priselpb.PacketType.DEFAULT)
        );
    }
    public toDebugString(p: Packet): string {
        try {
            return JSON.stringify(
                priselpb.Packet.toJson(p, { typeRegistry: typeRegistry }),
                null,
                2,
            );
        } catch (_) {
            return `${p}`;
        }
    }
    public serialize(pkt: Packet): Uint8Array {
        return priselpb.Packet.toBinary(pkt);
    }
    public deserialize(buffer: any): Packet | undefined {
        if (buffer instanceof ArrayBuffer) {
            return priselpb.Packet.fromBinary(new Uint8Array(buffer));
        } else if (buffer instanceof Uint8Array) {
            return priselpb.Packet.fromBinary(buffer);
        }
    }
}

export const Packet = new Packet$Type();
