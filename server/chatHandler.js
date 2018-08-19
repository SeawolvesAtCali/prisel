// @flow

import type { ContextT, SocketT } from './objects';

const debug = require('debug')('debug');
const networkUtils = require('./networkUtils');
const messages = require('./message/chat');
const roomMessages = require('./message/room');

const handleChatConnection = (context: ContextT) => (client: SocketT) => {
    client.on('PING', () => {
        networkUtils.emit(client, ...roomMessages.getPong());
    });
    client.on('CHAT', (data: { userId: string, message: string }) => {
        const { StateManager, io } = context;
        const { userId, message } = data;
        const { username } = StateManager.connections.controllers[userId];
        networkUtils.emitToChat(io, ...messages.getBroadcastMessage(username, message));
    });
};

module.exports = { handleChatConnection };
