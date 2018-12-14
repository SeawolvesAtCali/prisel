import { Message } from '../objects';
import GameType from '@monopoly/common/lib/message/game';
/**
 * Update client on current game state
 * @param {object} gameState
 */
export function getGameState(gameState: object): Message {
    return [GameType.GAME_STATE, gameState];
}
