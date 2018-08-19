// @flow

import type { ContextT, SocketT } from './objects';

const networkUtils = require('./networkUtils');
const roomMessages = require('./message/room');

const handleDisplayConnection = (context: ContextT) => (client: SocketT) => {
    client.on('PING', () => {
        networkUtils.emit(client, ...roomMessages.getPong());
    });
};

module.exports = {
    handleDisplayConnection,
};
