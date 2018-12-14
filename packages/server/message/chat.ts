import { Message } from '../objects';
import ChatType from '@monopoly/common/lib/message/chat';

export function getBroadcastMessage(username: string, message: string, roomId: string): Message {
    return [ChatType.BROADCAST, { username, message, roomId }];
}
