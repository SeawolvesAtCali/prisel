import { Message } from '../objects';
import { ChatType } from '@monopoly/common';

/**
 * Send a public message
 * @param {String} userId
 * @param {String} message
 */
export function getChat(userId: string, message: string, roomId: string = null): Message {
    return [ChatType.CHAT, { userId, message, roomId }];
}
/**
 * Send a chat message to a room
 * @param {String} message
 */
export function getChatToRoom(message: string): Message {
    return [ChatType.CHAT_TO_ROOM, { message }];
}
/**
 * Get chat history after certain message
 * @param {String} messageId
 */
export function getChatHistoryAfter(messageId: string): Message {
    return [ChatType.CHAT_HISTORY, { after: messageId }];
}
