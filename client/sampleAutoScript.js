const { getChat } = require('./message/chat');
const { wait, emit, disconnect } = require('./autoScriptUtils');
const constants = require('../common/constants');

/**
 * This is an example script that can be passed to sampleAutoChatClient.js
 *
 * Usage:
 *      node client/sampleAutoChatClient.js --script ./sampleAutoScript
 *
 * The path './sampleAutoScript' is this file's path relative to sampleAutoChatClient's path.
 */
module.exports = {
    actions: [
        emit(constants.CHAT_NS, (state) => getChat(state.userId, 'hello')),
        wait('BROADCAST'),
        emit(constants.CHAT_NS, (state) => getChat(state.userId, 'bye')),
        wait('BROADCAST'),
        disconnect(),
    ],
};
