const debug = require('debug')('debug');
const { newId } = require('./idUtils');
const networkUtils = require('./networkUtils');
const roomMessages = require('./message/room');
const { handleRoomActions } = require('./roomController');

const CONTROLLER = 'CONTROLLER';
function handleLogin(context, client) {
    return (data = {}) => {
        const id = newId(CONTROLLER);
        const { username } = data;
        const { StateManager, SocketManager } = context;
        const { connections } = StateManager;
        debug(`controller ${username} logged in, give id ${id}`);
        SocketManager.add(id, client);

        const controller = {
            id,
            username,
        };

        connections.controllers = {
            ...connections.controllers,
            [controller.id]: controller,
        };

        networkUtils.emit(client, ...roomMessages.getLoginAccept(controller.id));
    };
}

function handleControllerConnection(context) {
    return (client) => {
        debug('client connected');
        client.on('LOGIN', handleLogin(context, client));
        handleRoomActions(context, client);
    };
}

module.exports = {
    handleLogin,
    handleControllerConnection,
};
