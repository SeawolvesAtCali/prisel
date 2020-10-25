import { packet, packet_type, status } from '@prisel/protos';

export interface Response extends packet.Packet {
    type: packet_type.PacketType.RESPONSE;
    requestId: string;
    status: status.Status;
}

export function isResponse(p: packet.Packet): p is Response {
    return (
        p.type === packet_type.PacketType.RESPONSE &&
        typeof p.requestId === 'number' &&
        p.status != undefined
    );
}
