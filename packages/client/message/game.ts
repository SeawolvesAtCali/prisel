import { Message } from '../objects';
import { RoomType } from '@prisel/common';

/**
 * Roll a dice
 */
export function getDice(): Message {
    return ['DICE', {}];
}
/**
 * Response to response from server.
 * For example, when server ask client's decision on buying property.
 * @param {string} response
 * @param {string} actionId The current action server is asking
 */
export function getResponse(response: string, actionId: string): Message {
    return ['RESPONSE', { response, actionId }];
}

export function getGameStart(): Message {
    return [RoomType.GAME_START, {}];
}

/**
 * Give server instruction on current player's move
 * @param move
 */
export function getMove(move: { [key: string]: any }): Message {
    return ['MOVE', move];
}
