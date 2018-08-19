// @flow
const debug = require('debug')('debug');
const { connect, emitToServer } = require('./networkUtils');
const constants = require('../common/constants');
const { getLogin, getPing } = require('./message/room');

const DEFAULT_USERNAME = 'user';

type ClientPromiseT = Promise<{ state: {}, data: {}, emit: Function, setState: Function }>;

type RemoveListenerT = () => void;

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
    namespaces: Array<string>;
    state: {};
    connections: { [connection: string]: any };
    emit: Function;
    disconnect: () => void;
    setState: (newState: {}) => void;
    isConnected: boolean;

    constructor(...namespaces: Array<string>) {
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
    connect(): Promise<{ [connection: string]: {} }> {
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
    login(username: string = DEFAULT_USERNAME): ClientPromiseT {
        this.assertConnected();
        this.emit(constants.CONTROLLER_NS, ...getLogin(username));
        return this.once(constants.CONTROLLER_NS, 'LOGIN_ACCEPT');
    }

    /**
     * Emit to server
     * @param {String} namespace
     * @param {type and data} data
     */
    emit(namespace: string, ...data: [string, {}]) {
        this.assertConnected();
        if (namespace in this.connections) {
            emitToServer(this.connections[namespace], ...data);
        } else {
            throw new Error(`Cannot find connection ${namespace}`);
        }
    }

    /**
     * Throw error if not connected to server.
     */
    assertConnected() {
        if (!this.isConnected) {
            throw new Error('Please call client.connect(username) first');
        }
    }
    /**
     * Attach handler for messages from server
     * @param {String} namespace The namespace to listen to
     * @param {String} type message type
     * @param {(state, emit) => (data) => newState} func listener
     */
    on(
        namespace: string,
        type: string,
        func: (state: Object, emit: Function) => (data: Object) => Object | void,
    ): RemoveListenerT {
        this.assertConnected();
        if (namespace in this.connections) {
            const handler = (data) => {
                const updatedState = func(this.state, this.emit)(data) || this.state;
                this.state = updatedState;
            };
            this.connections[namespace].on(type, handler);
            return () => {
                this.connections[namespace].off(type, handler);
            };
        }
        throw new Error(`Cannot listen to ${type} on ${namespace}, have you connected?`);
    }

    /**
     * Set the client state
     * @param {Object} newState new state object to replace the old state
     */
    setState(newState: {}) {
        this.state = newState;
    }

    /**
     * Listen to message until state and message data matches requirement
     * @param {string} namespace namespace to listen to
     * @param {string} type message type to listen to
     * @param {function} checker function that returns true to stop listening
     */
    until(
        namespace: string,
        type: string,
        checker: (state: Object, data: Object) => boolean,
    ): ClientPromiseT {
        return new Promise((resolve, reject) => {
            let off;
            const checkUntil = (state: Object, emit: Function) => (data: Object) => {
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
    once(namespace: string, type: string): ClientPromiseT {
        return this.until(namespace, type, () => true);
    }

    exit() {}
}

module.exports = Client;

export type ClientClass = Client;
