import { Message } from '../objects';

export function getBroadcastMessage(username: string, message: string): Message {
    return ['BROADCAST', { username, message }];
}
