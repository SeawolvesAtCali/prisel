const debug = require('debug')('debug');
const networkUtils = require('./networkUtils');
const messages = require('./message/chat');

function handleChatConnection(context) {
    return (client) => {
        debug('on chat connection');
        client.on('CHAT', (data) => {
            debug('chatHandler:', data);
            const { StateManager, io } = context;
            const { userId, message } = data;
            const { username } = StateManager.connections.controllers[userId];
            networkUtils.emitToChat(io, ...messages.getBroadcastMessage(username, message));
        });
    };
}

module.exports = { handleChatConnection };
