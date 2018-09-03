import io from 'socket.io-client';
import assert from './assert';
import { SERVER } from '../common/constants';
import debug from './debug';

/**
 * Create connection with server
 * Usage:
 *     const connection = connect();
 *     const controllerClient = connection.as(constants.CONTROLLER_NS);
 *     const displayConnection = connection.as(constants.DISPLAY_NS);
 */
export function connect(callback?: (socket: SocketIOClient.Socket) => void) {
    const manager = new io.Manager(SERVER);
    return {
        as(namespace: string) {
            const socket = manager.socket(namespace);
            if (callback) {
                callback(socket);
            }
            return manager.socket(namespace);
        },
        disconnect() {
            // @ts-ignore
            // Manager has disconnect method, but not exposed in doc
            manager.disconnect();
        },
    };
}

/**
 * Send data to server.
 * Usage:
 *     emitToServer(controllerConnection, 'ROLL A DICE');
 */
export function emitToServer(client: SocketIOClient.Socket, message: string, data: object) {
    assert(data !== undefined, 'Did you forget to spread the argument using ...?');
    client.emit(message, data);
    debug(`CLIENT: ${message} ${JSON.stringify(data)}`);
}
