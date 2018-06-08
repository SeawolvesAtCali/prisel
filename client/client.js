const debug = require('debug')('debug');
const { connect, emitToServer } = require('./networkUtils');
const constants = require('../common/constants');
const { getLogin } = require('./message/room');

const DEFAULT_USERNAME = 'user';
class Client {
    constructor(...namespaces) {
        this.namespaces = namespaces || [];
        this.state = {};
        this.plugins = new Set();
        this.connections = {};
        this.emit = this.emit.bind(this);
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
            debug(`ERROR: Cannot find connection ${namespace}`);
            process.exit(2);
        }
    }

    /**
     * Attach handler for messages from server
     * @param {String} namespace The namespace to listen to
     * @param {String} type message type
     * @param {(state, emit) => (data) => newState} func listener
     */
    on(namespace, type, func) {
        if (namespace in this.connections) {
            this.connections[namespace].on(type, (data) => {
                debug(`${namespace}: ${type} ${data}`);
                const updatedState = func(this.state, this.emit)(data) || this.state;
                this.state = updatedState;
                this.triggerPlugins('onMessage', type, data);
            });
        } else {
            debug(`ERROR: cannot listen to ${type} on ${namespace}, have you connected?`);
            process.exit(2);
        }
    }
}

module.exports = Client;
