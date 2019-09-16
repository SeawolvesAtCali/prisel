import { Packet, isPacket } from './Packet';
import MessageType from './messageTypes';

export function createPacket(messageType: MessageType, payload: any) {
    const packet: Packet = {
        type: messageType,
        payload,
    };
    return JSON.stringify(packet);
}

export function parsePacket(packet: string): Packet {
    const parsed = JSON.parse(packet);
    return isPacket(parsed) ? parsed : undefined;
}
