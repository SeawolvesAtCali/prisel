// @flow

import type { ContextT, SocketT } from './objects';

const debug = require('debug')('debug');
const networkUtils = require('./networkUtils');
const messages = require('./message/chat');

const handleChatConnection = (context: ContextT) => (client: SocketT) => {
    debug('on chat connection');
    client.on('CHAT', (data: { userId: string, message: string }) => {
        debug('chatHandler:', data);
        const { StateManager, io } = context;
        const { userId, message } = data;
        const { username } = StateManager.connections.controllers[userId];
        networkUtils.emitToChat(io, ...messages.getBroadcastMessage(username, message));
    });
};

module.exports = { handleChatConnection };
