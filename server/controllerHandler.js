// @flow
import type { ContextT, SocketT, ClientT } from './objects';

const debug = require('debug')('debug');
const { newId } = require('./idUtils');
const networkUtils = require('./networkUtils');
const roomMessages = require('./message/room');
const { handleRoomActions } = require('./roomController');

const CONTROLLER = 'CONTROLLER';
const handleLogin = (context: ContextT, client: SocketT) => (data: { username: string }) => {
    const id = newId(CONTROLLER);
    const { username } = data;
    const { StateManager, SocketManager } = context;
    const { connections } = StateManager;
    SocketManager.add(id, client);

    const controller: ClientT = {
        id,
        username,
        type: 'controller',
    };

    connections.controllers = {
        ...connections.controllers,
        id: controller,
    };

    networkUtils.emit(client, ...roomMessages.getLoginAccept(controller.id));
};

const handleControllerConnection = (context: ContextT) => (client: SocketT) => {
    client.on('PING', () => {
        networkUtils.emit(client, ...roomMessages.getPong());
    });
    client.on('LOGIN', handleLogin(context, client));
    handleRoomActions(context, client);
};

module.exports = {
    handleLogin,
    handleControllerConnection,
};
