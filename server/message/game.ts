import { Message } from '../objects';

/**
 * Update client on current game state
 * @param {object} gameState
 */
export function getGameState(gameState: object): Message {
    return ['GAME_STATE', gameState];
}
