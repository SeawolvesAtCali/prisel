const debug = require('debug')('debug');
const { connect, emitToServer } = require('./networkUtils');
const constants = require('../common/constants');
const { getLogin } = require('./message/room');

const DEFAULT_USERNAME = 'user';

/**
 * Client class
 *
 * A client encapsulates the socket.io connection with server and provides methods to interact with the connection.
 * A client has the following lifecycle
 *
 * Create: A client is instantiated.
 * Connect: the client connects to server and logs in.
 * Message: Client receives message from server
 * Disconnect: Client disconnects from server and stop process.
 *
 * To create a client, call the constructor with socket namespaces that this client needs to connect to.
 *
 *      const client = new Client(CHAT_NS, CONTROLLER_NS); // create a client to be connect to chat and controller namespace
 *
 * Creating a Client instance doesn't connect to the server, we need to call `client.connect(username)`
 * If controller namespace is used, connect will also log in with the username.
 *
 * After a client is connected, we can attach message handler using `client.on`
 * We can use `client.addPlugin` before connect to attach some plugins. Each plugin will be trigger upon some lifecycle
 */
class Client {
    constructor(...namespaces) {
        this.namespaces = namespaces || [];
        this.state = {};
        this.plugins = new Set();
        this.connections = {};
        this.emit = this.emit.bind(this);
        this.isConnected = false;
    }

    /**
     * trigger all the plugins with the event name
     * @param {String} event event name starts with 'on'
     */
    triggerPlugins(event, ...data) {
        this.plugins.forEach((plugin) => {
            if (event in plugin) {
                plugin[event](this.state, this.emit, ...data);
            }
        });
    }
    /**
     * Connect to server and log in as [username]
     * @param {String} username
     */
    connect(username = DEFAULT_USERNAME) {
        const connection = connect();
        this.connections = {};
        this.namespaces.forEach((namespace) => {
            const conn = connection.as(namespace);
            this.connections[namespace] = conn;
            if (namespace === constants.CONTROLLER_NS) {
                emitToServer(conn, ...getLogin(username));
                conn.on('LOGIN_ACCEPT', (data) => {
                    debug(`Logged in as ${username}. Id is ${data.userId}`);
                    this.state = {
                        ...this.state,
                        isLoggedIn: true,
                        userId: data.userId,
                    };
                    this.triggerPlugins('onConnect');
                });
            }
        });
        this.isConnected = true;
    }

    addPlugin(plugin) {
        this.plugins.add(plugin);
    }

    removePlugin(plugin) {
        this.plugins.delete(plugin);
    }

    /**
     * Emit to server
     * @param {String} namespace
     * @param {type and data} data
     */
    emit(namespace, ...data) {
        if (namespace in this.connections) {
            emitToServer(this.connections[namespace], ...data);
        } else {
            throw new Error(`Cannot find connection ${namespace}`);
        }
    }

    /**
     * Attach handler for messages from server
     * @param {String} namespace The namespace to listen to
     * @param {String} type message type
     * @param {(state, emit) => (data) => newState} func listener
     */
    on(namespace, type, func) {
        if (!this.isConnected) {
            throw new Error('Please call client.connect(username) first');
        }
        if (namespace in this.connections) {
            this.connections[namespace].on(type, (data) => {
                debug(`${namespace}: ${type} ${data}`);
                const updatedState = func(this.state, this.emit)(data) || this.state;
                this.state = updatedState;
                this.triggerPlugins('onMessage', type, data);
            });
        } else {
            throw new Error(`Cannot listen to ${type} on ${namespace}, have you connected?`);
        }
    }
}

module.exports = Client;
