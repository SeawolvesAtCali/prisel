import { Message } from '../objects';
import { MessageType } from '@prisel/common';

export function getGameStart(): Message {
    return [MessageType.GAME_START, {}];
}

/**
 * Give server instruction on current player's move
 * @param move
 */
export function getMessage(message: { [key: string]: any }): Message {
    return [MessageType.MESSAGE, message];
}
