module.exports = {
    /**
     * Update client on current game state
     * @param {object} gameState
     */
    getGameState(gameState) {
        return ['GAME_STATE', gameState];
    },
};
