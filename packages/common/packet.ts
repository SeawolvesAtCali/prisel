import { MessageType, messageTypeMap } from './messageTypes';
import { enumToMap } from './enumToMap';

export interface Packet<Payload = any> {
    type: PacketType;
    system_action?: MessageType;
    action?: any;
    payload?: Payload;
}

export interface Request<Payload = any> extends Packet<Payload> {
    type: PacketType.REQUEST;
    request_id: string;
}

export interface Response<Payload = any> extends Packet<Payload> {
    type: PacketType.RESPONSE;
    status: Status;
    request_id: string;
}

export function isStatus(status: any): status is Status {
    return Object.values(Status).some((statusValue) => statusValue === status);
}

export function isResponse(packet: Packet): packet is Response {
    if (!packet) {
        return false;
    }
    const response = packet as Response;
    return (
        response.request_id !== undefined &&
        response.type === PacketType.RESPONSE &&
        isStatus(response.status)
    );
}
export function isRequest(packet: Packet): packet is Request {
    if (!packet) {
        return false;
    }
    const request = packet as Request;
    return request.request_id !== undefined && request.type === PacketType.REQUEST;
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
    const { system_action: systemAction, type } = packet;

    const debugPacket: any = { ...packet };
    if (systemAction !== undefined) {
        debugPacket.system_action = messageTypeMap.get(systemAction);
    }
    if (type !== undefined) {
        debugPacket.type = packetTypeMap.get(type);
    }
    if (isResponse(packet)) {
        debugPacket.status = statusMap.get(packet.status);
    }
    return JSON.stringify(debugPacket);
}
