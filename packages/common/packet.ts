import { priselpb } from '@prisel/protos';
import * as flatbuffers from 'flatbuffers';
import { nonNull } from './assert';
import { StatusBuilder } from './status';

export type Packet = priselpb.Packet;

export class PacketBuilder {
    systemAction = priselpb.SystemActionType.UNSPECIFIED;
    packetType = priselpb.PacketType.DEFAULT;
    action = 'unspecified';
    id?: string;
    payload?: Uint8Array;
    status?: StatusBuilder;

    public static forSystemAction(action: priselpb.SystemActionType) {
        const builder = new PacketBuilder();
        builder.systemAction = action;
        return builder;
    }

    public static forAction(action: string) {
        const builder = new PacketBuilder();
        builder.action = action;
        return builder;
    }

    public withPayload(payloadBuilder: flatbuffers.Builder) {
        this.payload = payloadBuilder.asUint8Array();
        return this;
    }

    public withPayloadBuilder(func: (builder: flatbuffers.Builder) => number) {
        const builder = new flatbuffers.Builder(1024);
        const offset = func(builder);
        builder.finish(offset);
        return this.withPayload(builder);
    }

    public build(): [Uint8Array, priselpb.Packet] {
        const builder: flatbuffers.Builder = new flatbuffers.Builder(1024);
        const actionTypeString = builder.createString(this.action);
        const requestIdString = nonNull(this.id) ? builder.createString(this.id) : undefined;
        const payloadOffset = nonNull(this.payload)
            ? priselpb.Packet.createPayloadVector(builder, this.payload)
            : 0;

        const statusOffset = nonNull(this.status) ? this.status.build(builder) : undefined;

        priselpb.Packet.startPacket(builder);

        priselpb.Packet.addType(builder, this.packetType);
        if (nonNull(requestIdString)) {
            priselpb.Packet.addRequestId(builder, requestIdString);
        }
        if (nonNull(statusOffset)) {
            priselpb.Packet.addStatus(builder, statusOffset);
        }
        priselpb.Packet.addSystemActionType(builder, this.systemAction);
        if (nonNull(this.action)) {
            priselpb.Packet.addActionType(builder, actionTypeString);
        }

        if (nonNull(this.payload)) {
            priselpb.Packet.addPayload(builder, payloadOffset);
        }

        builder.finish(priselpb.Packet.endPacket(builder));

        const uint8Array = builder.asUint8Array();
        const packet = priselpb.Packet.getRootAsPacket(new flatbuffers.ByteBuffer(uint8Array));
        return [uint8Array, packet];
    }
}

export function isValidPacket(p: Packet | undefined): p is Packet {
    return (
        nonNull(p) &&
        (p.systemActionType() != priselpb.SystemActionType.UNSPECIFIED || p.actionType() != null)
    );
}

export function isValidRequest(
    p: Packet | undefined,
): p is Packet & {
    type: () => priselpb.PacketType.REQUEST;
    requestId: () => string;
} {
    return isValidPacket(p) && p.type() === priselpb.PacketType.REQUEST && nonNull(p.requestId());
}

export function isValidResponse(
    p: Packet | undefined,
): p is Packet & {
    type: () => priselpb.PacketType.RESPONSE;
    requestId: () => string;
    status: () => priselpb.Status;
} {
    return (
        isValidPacket(p) &&
        p.type() === priselpb.PacketType.RESPONSE &&
        nonNull(p.requestId()) &&
        nonNull(p.status())
    );
}

class PacketHelper {
    public getBuilder(size = 1024) {
        return new flatbuffers.Builder(size);
    }
    public forSystemAction(action: priselpb.SystemActionType) {
        return PacketBuilder.forSystemAction(action);
    }
    public forAction(action: string) {
        return PacketBuilder.forAction(action);
    }
    public getSystemAction(packet: Packet | undefined) {
        if (packet) {
            return packet.systemActionType();
        }
        return priselpb.SystemActionType.UNSPECIFIED;
    }
    public getAction(packet: Packet | undefined) {
        if (packet) {
            return packet.actionType();
        }
        return null;
    }
    public isAnySystemAction(
        packet: Packet | undefined,
    ): packet is Packet & {
        systemActionType: () => Exclude<
            priselpb.SystemActionType,
            priselpb.SystemActionType.UNSPECIFIED
        >;
    } {
        return (
            nonNull(packet) && packet.systemActionType() != priselpb.SystemActionType.UNSPECIFIED
        );
    }
    public isSystemAction<T extends priselpb.SystemActionType>(
        packet: Packet | undefined,
        systemActionType: T,
    ): packet is Packet & {
        systemActionType: () => T;
    } {
        return this.isAnySystemAction(packet) && packet.systemActionType() === systemActionType;
    }

    public isAnyCustomAction(
        packet: Packet | undefined,
    ): packet is Packet & {
        actionType: () => string;
    } {
        return (
            nonNull(packet) &&
            packet.systemActionType() === priselpb.SystemActionType.UNSPECIFIED &&
            nonNull(packet.actionType())
        );
    }

    public isCustomAction<T extends string>(
        packet: Packet | undefined,
        action: T,
    ): packet is Packet & {
        actionType: () => T;
    } {
        return this.isAnyCustomAction(packet) && packet.actionType() === action;
    }

    public hasPayload(packet: Packet | undefined) {
        return packet && nonNull(packet.payloadArray());
    }

    /**
     * Extract payload from packet. If the payload doesn't match the
     * payloadCreator, it will not thrown but the result will be unexpected.
     * @param packet
     * @param payloadCreator
     * @returns null if packet has no payload, otherwise the Payload.
     */
    public getPayload<T>(
        packet: Packet | undefined,
        payloadCreator: (bb: flatbuffers.ByteBuffer, obj?: T) => T,
    ): T | null {
        if (!packet) {
            return null;
        }
        const payloadArray: Uint8Array | null = packet.payloadArray();
        if (nonNull(payloadArray)) {
            return payloadCreator(new flatbuffers.ByteBuffer(payloadArray));
        }
        return null;
    }

    public isStatusOk(packet: Packet | undefined) {
        return packet?.status()?.code() == priselpb.StatusCode.OK;
    }

    public isStatusFailed(packet: Packet | undefined) {
        return packet?.status()?.code() == priselpb.StatusCode.FAILED;
    }

    public getStatusMessage(packet: Packet | undefined) {
        return packet?.status()?.message() ?? '';
    }
    public getStatusDetail(packet: Packet | undefined) {
        return packet?.status()?.detail() ?? '';
    }

    public verify(packet: Packet | undefined) {
        if (!isValidPacket(packet)) {
            return false;
        }
        return (
            isValidRequest(packet) ||
            isValidResponse(packet) ||
            (isValidPacket(packet) && packet.type() == priselpb.PacketType.DEFAULT)
        );
    }

    public toDebugString(p: Packet): string {
        return JSON.stringify({
            type: p.type(),
            request_id: p.requestId(),
            systemActionType: p.systemActionType(),
            actionType: p.actionType(),
            status: p.status() ?? {
                code: p.status()?.code(),
                message: p.status()?.message(),
                detail: p.status()?.detail(),
            },
            hasPayload: nonNull(p.payloadArray()),
        });
    }
}

export const Packet = new PacketHelper();
