import { Message } from '../objects';
import ChatType from '../../common/message/chat';

export function getBroadcastMessage(username: string, message: string): Message {
    return [ChatType.BROADCAST, { username, message }];
}
