import { MessageType, messageTypeMap } from './messageTypes';
import { enumToMap } from './enumToMap';

export interface Packet<T = any> {
    type: PacketType;
    systemAction?: MessageType;
    action?: any;
    status?: Status; // only in response
    payload?: T;
    id?: string;
}

export type Request<T = any> = Omit<Packet<T>, 'status'> & {
    type: PacketType.REQUEST;
    id: string;
};

export interface Response<T = any> extends Packet<T> {
    type: PacketType.RESPONSE;
    status: Status;
    id: string;
}

export function isResponse(packet: Packet): packet is Response {
    if (!packet) {
        return false;
    }
    return (
        packet.id !== undefined &&
        packet.type === PacketType.RESPONSE &&
        Object.values(Status).some((statusValue) => statusValue === packet.status)
    );
}
export function isRequest(packet: Packet): packet is Request {
    if (!packet) {
        return false;
    }
    return packet.id !== undefined && packet.type === PacketType.REQUEST;
}

export enum PacketType {
    DEFAULT = 0,
    REQUEST = 1,
    RESPONSE = 2,
}

export const packetTypeMap = enumToMap<PacketType>(PacketType);

export enum Status {
    UNSET = 0,
    SUCCESS = 1,
    FAILURE = 2,
}

export const statusMap = enumToMap<Status>(Status);

export function toDebugString(packet: Packet) {
    const { systemAction, status, type } = packet;
    const debugPacket: any = { ...packet };
    if (systemAction !== undefined) {
        debugPacket.systemAction = messageTypeMap.get(systemAction);
    }
    if (type !== undefined) {
        debugPacket.type = packetTypeMap.get(type);
    }
    if (status !== undefined) {
        debugPacket.status = statusMap.get(status);
    }
    return JSON.stringify(debugPacket);
}
