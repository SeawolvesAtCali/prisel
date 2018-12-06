import { Message } from '../objects';
import ChatType from '../../common/message/chat';

export function getBroadcastMessage(
    username: string,
    message: string,
    roomId: string = null,
): Message {
    return [ChatType.BROADCAST, { username, message, roomId }];
}
