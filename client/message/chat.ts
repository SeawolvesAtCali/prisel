import { Message } from '../objects';
/**
 * Send a public message
 * @param {String} userId
 * @param {String} message
 */
export function getChat(userId: string, message: string): Message {
    return ['CHAT', { userId, message }];
}
/**
 * Send a chat message to a room
 * @param {String} message
 */
export function getChatToRoom(message: string): Message {
    return ['CHAT_TO_ROOM', { message }];
}
/**
 * Get chat history after certain message
 * @param {String} messageId
 */
export function getChatHistoryAfter(messageId: string): Message {
    return ['CHAT_HISTORY', { after: messageId }];
}
