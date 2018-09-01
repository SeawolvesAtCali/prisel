import { Message } from '../objects';

/**
 * Update client on current game state
 * @param {object} gameState
 */
export function getGameState(gameState: Object): Message {
    return ['GAME_STATE', gameState];
}
