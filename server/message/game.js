// @flow

import type { MessageT } from '../objects';

module.exports = {
    /**
     * Update client on current game state
     * @param {object} gameState
     */
    getGameState(gameState: Object): MessageT {
        return ['GAME_STATE', gameState];
    },
};
