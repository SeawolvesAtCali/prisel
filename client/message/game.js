module.exports = {
    /**
     * Roll a dice
     */
    getDice() {
        return ['DICE', {}];
    },
    /**
     * Response to response from server.
     * For example, when server ask client's decision on buying property.
     * @param {string} response
     * @param {string} actionId The current action server is asking
     */
    getResponse(response, actionId) {
        return ['RESPONSE', { response, actionId }];
    },
};
