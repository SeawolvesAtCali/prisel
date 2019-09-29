import MessageType, { isMessageType } from './messageTypes';
import { Payload, isPayload } from './Payload';

export interface Packet {
    type: MessageType;
    payload: Payload;
}

export function isPacket(arg: any): arg is Packet {
    return isMessageType(arg.type) && isPayload(arg.payload);
}
