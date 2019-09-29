import { Message } from '../objects';
import { MessageType } from '@prisel/common';

/**
 * Update client on current game state
 * @param {object} gameState
 */
export function getGameState(gameState: { [key: string]: any }): Message {
    // using literal object type instead of Payload because Payload is an interface.
    // It's hard to assign another interface to Payload due to the lack of index
    // signature https://github.com/microsoft/TypeScript/issues/15300
    return [MessageType.GAME_STATE, gameState];
}
