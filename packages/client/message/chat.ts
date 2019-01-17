import { Message } from '../objects';
import { MessageType } from '@prisel/common';

/**
 * Send a public message
 * @param {String} userId
 * @param {String} message
 */
export function getChat(message: string): Message {
    return [MessageType.CHAT, { message }];
}

/**
 * Get chat history after certain message
 * @param {String} messageId
 */
export function getChatHistoryAfter(messageId: string): Message {
    return [MessageType.CHAT_HISTORY, { after: messageId }];
}
