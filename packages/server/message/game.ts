import { Message } from '../objects';
import { MessageType } from '@prisel/common';
/**
 * Update client on current game state
 * @param {object} gameState
 */
export function getGameState(gameState: object): Message {
    return [MessageType.GAME_STATE, gameState];
}
