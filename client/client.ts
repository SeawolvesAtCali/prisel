import debug from './debug';
import { connect, emitToServer } from './networkUtils';
import { CONTROLLER_NS } from '../common/constants';

import { getLogin, getPing } from './message/room';

const DEFAULT_USERNAME = 'user';
interface AnyObject {
    [prop: string]: any;
}

type EmitFunc = (namespace: string, messageType: string, data: AnyObject) => void;
type SetStateFunc = (newState: AnyObject) => void;
type ClientPromise = Promise<{
    state: AnyObject;
    data: AnyObject;
    emit: EmitFunc;
    setState: SetStateFunc;
}>;

type RemoveListenerFunc = () => void;

/**
 * Client class
 *
 * A client encapsulates the socket.io connection with server and provides methods to interact with the connection.
 * To create a client, call the constructor with socket namespaces that this client needs to connect to.
 *
 *      const client = new Client(CHAT_NS, CONTROLLER_NS); // create a client to be connect to chat and controller namespace
 *
 * Creating a Client instance doesn't connect to the server, we need to call `client.connect()`
 * If controller namespace is used, connect will also log in with the username.
 *
 * After connection, we can login using `client.login(username)`
 *
 * After a client is connected, we can attach message handler using `client.on`
 */
class Client {
    public namespaces: string[];
    public state: AnyObject;
    public connections: { [connection: string]: SocketIOClient.Socket };
    public disconnect: () => void;
    public isConnected: boolean;

    constructor(...namespaces: string[]) {
        this.namespaces = namespaces || [];
        this.state = {};
        this.connections = {};
        this.emit = this.emit.bind(this);
        this.setState = this.setState.bind(this);
        this.isConnected = false;
    }

    /**
     * Connect to server
     */
    public connect(): Promise<{ [connection: string]: AnyObject }> {
        return new Promise((resolve, reject) => {
            const connection = connect();
            this.connections = {};
            const ping = getPing();
            this.namespaces.forEach((namespace) => {
                const conn = connection.as(namespace);
                conn.on('PONG', () => {
                    this.connections[namespace] = conn;
                    if (Object.keys(this.connections).length === this.namespaces.length) {
                        this.isConnected = true;
                        resolve(this.connections);
                    }
                });
                emitToServer(conn, ...ping);
            });
            this.isConnected = true;
            this.disconnect = connection.disconnect;
            return this.connections;
        });
    }

    /**
     * Login to server using the username specified.
     * Throw error if not connected, or don't have controller namespace.
     * @param {string} username username to login with
     */
    public login(username: string = DEFAULT_USERNAME): ClientPromise {
        this.assertConnected();
        this.emit(CONTROLLER_NS, ...getLogin(username));
        return this.once(CONTROLLER_NS, 'LOGIN_ACCEPT');
    }

    /**
     * Emit to server
     * @param {String} namespace
     * @param {type and data} data
     */
    public emit(namespace: string, messageType: string, data: AnyObject) {
        this.assertConnected();
        if (namespace in this.connections) {
            emitToServer(this.connections[namespace], messageType, data);
        } else {
            throw new Error(`Cannot find connection ${namespace}`);
        }
    }

    /**
     * Throw error if not connected to server.
     */
    public assertConnected() {
        if (!this.isConnected) {
            throw new Error('Please call client.connect(username) first');
        }
    }
    /**
     * Attach handler for messages from server
     * @param {String} namespace The namespace to listen to
     * @param {String} messageType message type
     * @param {(state, emit) => (data) => newState} handler listener
     */
    public on(
        namespace: string,
        messageType: string,
        callback: (data: AnyObject, state: AnyObject, emit: EmitFunc) => AnyObject | void,
    ): RemoveListenerFunc {
        this.assertConnected();
        if (namespace in this.connections) {
            const handler = (data: AnyObject) => {
                const updatedState = callback(data, this.state, this.emit) || this.state;
                this.state = updatedState;
            };
            this.connections[namespace].on(messageType, handler);
            return () => {
                this.connections[namespace].off(messageType, handler);
            };
        }
        throw new Error(`Cannot listen to ${messageType} on ${namespace}, have you connected?`);
    }

    /**
     * Set the client state
     * @param {Object} newState new state object to replace the old state
     */
    public setState(newState: AnyObject) {
        this.state = newState;
    }

    /**
     * Listen to message until state and message data matches requirement
     * @param {string} namespace namespace to listen to
     * @param {string} type message type to listen to
     * @param {function} checker function that returns true to stop listening
     */
    public until(
        namespace: string,
        type: string,
        checker: (state: AnyObject, data: AnyObject) => boolean,
    ): ClientPromise {
        return new Promise((resolve, reject) => {
            let off: RemoveListenerFunc;
            const checkUntil = (state: AnyObject, emit: EmitFunc) => (data: AnyObject) => {
                if (checker(state, data)) {
                    off();
                    resolve({ state, data, emit, setState: this.setState });
                }
            };
            off = this.on(namespace, type, checkUntil);
        });
    }

    /**
     * Listen for message until receive the message once.
     * @param {string} namespace namespace to listen to
     * @param {string} type message type to listen to
     */
    public once(namespace: string, type: string): ClientPromise {
        return this.until(namespace, type, () => true);
    }
}

export default Client;
