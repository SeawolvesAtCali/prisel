import { packet, packet_type } from '@prisel/protos';

export interface Request extends packet.Packet {
    type: packet_type.PacketType.REQUEST;
    requestId: string;
}

export function isRequest(p: packet.Packet): p is Request {
    return p.type === packet_type.PacketType.REQUEST && p.requestId !== undefined;
}
