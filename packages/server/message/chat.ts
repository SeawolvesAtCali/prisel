import { Message } from '../objects';
import { MessageType } from '@prisel/common';

export function getBroadcastMessage(username: string, message: string, roomId: string): Message {
    return [MessageType.BROADCAST, { username, message, roomId }];
}
