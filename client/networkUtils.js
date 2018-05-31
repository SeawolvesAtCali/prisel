const io = require('socket.io-client');
const assert = require('assert');
const constants = require('../common/constants');

/**
 * Create connection with server
 * Usage:
 *     const connection = connect();
 *     const controllerClient = connection.as(constants.CONTROLLER_NS);
 *     const displayConnection = connection.as(constants.DISPLAY_NS);
 */
function connect() {
    const manager = new io.Manager(constants.SERVER);
    return {
        as(namespace) {
            return manager.socket(namespace);
        },
    };
}

/**
 * Send data to server.
 * Usage:
 *     emitToServer(controllerConnection, 'ROLL A DICE');
 */
function emitToServer(client, ...data) {
    assert(data.length > 1, 'Did you forget to spread the argument using ...?');
    client.emit(...data);
}

module.exports = {
    connect,
    emitToServer,
};
