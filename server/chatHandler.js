const debug = require('debug')('debug');
const networkUtils = require('./networkUtils');
const messages = require('./message/chat');

function handleChatConnection(StateManager, io) {
    return (client) => {
        debug('on chat connection');
        client.on('CHAT', (data) => {
            debug(data);
            // client.broadcast.emit(
            //     ...messages.getBroadcastMessage(
            //         StateManager.connections.controllers[data.userId].username,
            //         data.message,
            //     ),
            // );
            networkUtils.emitToChat(
                io,
                ...messages.getBroadcastMessage(
                    StateManager.connections.controllers[data.userId].username,
                    data.message,
                ),
            );
        });
    };
}

module.exports = { handleChatConnection };
