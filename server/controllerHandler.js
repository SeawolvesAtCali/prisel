const debug = require('debug')('debug');
const { newId } = require('./idUtils');
const networkUtils = require('./networkUtils');
const roomMessages = require('./roomMessages');

const CONTROLLER = 'CONTROLLER';
function handleLogin(StateManager, client) {
    return (data) => {
        const controller = {
            socket: client,
            id: newId(CONTROLLER),
        };
        debug(`controller ${data.username} logged in, give id ${controller.id}`);
        StateManager.connections.controllers.push(controller);
        networkUtils.emit(client, ...roomMessages.getLoginAccept());
    };
}

function handleControllerConnection(StateManager) {
    return (client) => {
        debug('client connected');
        client.on('LOGIN', handleLogin(StateManager, client));

        // Add message handlings below
        // for example:
        //      client.on('JOIN', handleJoin);
        //      client.on('LEAVE', handleLeave);
    };
}

module.exports = {
    handleLogin,
    handleControllerConnection,
};
