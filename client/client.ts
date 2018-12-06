import debug from './debug';
import once from 'lodash/once';
import { SERVER } from '../common/constants';

import { getLogin } from './message/room';
import RoomType from '../common/message/room';
import io from 'socket.io-client';

const DEFAULT_USERNAME = 'user';
interface AnyObject {
    [prop: string]: any;
}

type EmitFunc = (messageType: string, data: AnyObject) => void;
type SetStateFunc = (newState: AnyObject) => void;
type ClientPromise = Promise<{
    state: AnyObject;
    data: AnyObject;
    emit: EmitFunc;
    setState: SetStateFunc;
}>;

type RemoveListenerFunc = () => void;

const DEFAULT_TIMEOUT = 5000;
const CONNECTION_TIMEOUT = DEFAULT_TIMEOUT;
const LOGIN_TIMEOUT = DEFAULT_TIMEOUT;

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
    public state: AnyObject;
    private conn: SocketIOClient.Socket;
    private serverUri: string;

    constructor(server: string = SERVER) {
        this.state = {};
        this.serverUri = server;
        this.emit = this.emit.bind(this);
        this.setState = this.setState.bind(this);
        this.connect = once(this.connect.bind(this));
    }

    public get connection(): SocketIOClient.Socket {
        if (this.conn) {
            return this.conn;
        }
        throw new Error('Please call client.connect(username) first');
    }

    public get isConnected(): boolean {
        return !!this.conn;
    }

    /**
     * Connect to server
     */
    public connect(): Promise<SocketIOClient.Socket> {
        return new Promise((resolve, reject) => {
            const connection = io(this.serverUri, { transports: ['websocket'] });
            const connectionTimeout = setTimeout(() => {
                clearTimeout(connectionTimeout);
                connection.off('connect', onConnect);
                reject(new Error('connection timeout'));
            }, CONNECTION_TIMEOUT);
            const onConnect = () => {
                debug('client connected');
                this.conn = connection;
                connection.off('connect', onConnect);
                connection.on('disconnect', () => {
                    debug('client disconnected');
                });
                connection.on('error', (e: any) => {
                    debug('client error', e);
                });
                clearTimeout(connectionTimeout);
                resolve(connection);
            };
            connection.on('connect', onConnect);
        });
    }

    public disconnect() {
        this.connection.close();
    }

    /**
     * Login to server using the username specified.
     * Throw error if not connected, or don't have controller namespace.
     * @param {string} username username to login with
     */
    public login(username: string = DEFAULT_USERNAME): ClientPromise {
        this.emit(...getLogin(username));
        return this.until(
            RoomType.SUCCESS,
            (_, data) => data.action === RoomType.LOGIN,
            LOGIN_TIMEOUT,
        );
    }

    /**
     * Emit to server
     * @param {String} namespace
     * @param {type and data} data
     */
    public emit(messageType: string, data: AnyObject) {
        this.connection.emit(messageType, data);
    }

    /**
     * Attach handler for messages from server
     * @param {String} namespace The namespace to listen to
     * @param {String} messageType message type
     * @param {(state, emit) => (data) => newState} handler listener
     */
    public on(
        messageType: string,
        callback: (data: AnyObject, state: AnyObject, emit: EmitFunc) => AnyObject | void,
    ): RemoveListenerFunc {
        const handler = (data: AnyObject) => {
            const updatedState = callback(data, this.state, this.emit) || this.state;
            this.state = updatedState;
        };
        this.connection.on(messageType, handler);
        return () => {
            this.connection.off(messageType, handler);
        };
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
     * @param {string} type message type to listen to
     * @param {function} checker function that returns true to stop listening
     */
    public until(
        type: string,
        checker: (state: AnyObject, data: AnyObject) => boolean,
        timeout?: number,
    ): ClientPromise {
        return new Promise((resolve, reject) => {
            const timer = isFinite(timeout)
                ? setTimeout(() => {
                      off();
                      reject(new Error(`"until" timeout for type ${type}`));
                  }, timeout)
                : undefined;
            const checkUntil = (data: AnyObject, state: AnyObject, emit: EmitFunc) => {
                if (checker(state, data)) {
                    off();
                    if (timer !== undefined) {
                        clearTimeout(timer);
                    }
                    resolve({ state, data, emit, setState: this.setState });
                }
            };
            const off = this.on(type, checkUntil);
        });
    }

    /**
     * Listen for message until receive the message once.
     * @param {string} namespace namespace to listen to
     * @param {string} type message type to listen to
     */
    public once(type: string): ClientPromise {
        return this.until(type, () => true);
    }
}

export default Client;
