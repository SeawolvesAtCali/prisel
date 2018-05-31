const { newId } = require('./idUtils');
const networkUtils = require('./networkUtils');
const roomMessages = require('./roomMessages');

const CONTROLLER = 'CONTROLLER';
function handleLogin(StateManager, client) {
    const controller = {
        socket: client,
        id: newId(CONTROLLER),
    };
    StateManager.connections.controllers.push(controller);
    networkUtils.emit(client, ...roomMessages.getLoginAccept());
}

function handleControllerConnection(StateManager) {
    return (client) => {
        // eslint-disable-next-line
        const controller = handleLogin(StateManager, client);

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
