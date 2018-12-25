import { Message } from '../objects';
import { ChatType } from '@prisel/common';

export function getBroadcastMessage(username: string, message: string, roomId: string): Message {
    return [ChatType.BROADCAST, { username, message, roomId }];
}
