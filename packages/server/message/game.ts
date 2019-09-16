import { Message } from '../objects';
import { MessageType, Payload } from '@prisel/common';

/**
 * Update client on current game state
 * @param {object} gameState
 */
export function getGameState(gameState: Payload): Message {
    return [MessageType.GAME_STATE, gameState];
}
