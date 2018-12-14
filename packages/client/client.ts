import debug from './debug';
import once from 'lodash/once';
import { SERVER } from '@monopoly/common/lib/constants';
import createPacket from '@monopoly/common/lib/createPacket';

import { getLogin, getExit } from './message/room';
import RoomType from '@monopoly/common/lib/message/room';
import PubSub from './pubSub';
import withTimer from './withTimer';

const DEFAULT_USERNAME = 'user';
export interface AnyObject {
    [prop: string]: any;
}

type MessageData = AnyObject;

type EmitFunc = (messageType: string, data: AnyObject) => void;

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

    public get connection(): WebSocket {
        if (this.conn) {
            return this.conn;
        }
        throw new Error('Please call client.connect(username) first');
    }

    public get isConnected(): boolean {
        return !!this.conn;
    }
    public state: AnyObject;
    private conn: WebSocket;
    private serverUri: string;
    private messageQueue = new PubSub();

    constructor(server: string = SERVER) {
        this.state = {};
        this.serverUri = server;
        this.connect = once(this.connect.bind(this));
    }

    /**
     * Connect to server
     */
    public async connect(): Promise<WebSocket> {
        const connection = new WebSocket(this.serverUri);

        connection.onclose = () => {
            debug('client disconnected');
            this.messageQueue.close();
        };

        connection.onerror = (e: any) => {
            debug('client error', e);
        };
        connection.onmessage = (message) => {
            this.handleMessage(message.data);
        };
        this.conn = connection;
        await withTimer(
            new Promise((resolve) => {
                const onOpen = () => {
                    resolve();
                    connection.onopen = null;
                };
                connection.onopen = onOpen;
            }),
            CONNECTION_TIMEOUT,
        );
        return connection;
    }

    public exit() {
        this.emit(...getExit());
        this.disconnect();
    }

    public handleMessage(rawMessage: string) {
        const message = JSON.parse(rawMessage);
        this.messageQueue.dispatch(message.type, message.payload);
    }

    /**
     * Login to server using the username specified.
     * Throw error if not connected, or don't have controller namespace.
     * @param {string} username username to login with
     */
    public login(username: string = DEFAULT_USERNAME): Promise<MessageData> {
        this.emit(...getLogin(username));
        return withTimer(
            this.onceWhen(RoomType.SUCCESS, (_, data) => data.action === RoomType.LOGIN),
            LOGIN_TIMEOUT,
        );
    }

    /**
     * Emit to server
     * @param {String} namespace
     * @param {type and data} data
     */
    public emit(messageType: string, data: AnyObject) {
        this.connection.send(createPacket(messageType, data));
    }

    /**
     * Attach handler for messages from server
     * @param {String} namespace The namespace to listen to
     * @param {String} messageType message type
     * @param {(state, emit) => (data) => newState} handler listener
     */
    public on(
        messageType: string,
        callback: (data: AnyObject) => AnyObject | void,
    ): RemoveListenerFunc {
        const handler = (data: AnyObject) => {
            const updatedState = callback(data) || this.state;
            this.state = updatedState;
        };
        return this.messageQueue.on(messageType, handler);
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
    public onceWhen(
        type: string,
        checker: (state: AnyObject, data: AnyObject) => boolean,
    ): Promise<MessageData> {
        return new Promise((resolve) => {
            this.messageQueue.onceWhen(type, resolve, (data) => checker(this.state, data));
        });
    }

    /**
     * Listen for message until receive the message once.
     * @param {string} namespace namespace to listen to
     * @param {string} type message type to listen to
     */
    public once(type: string): Promise<MessageData> {
        return new Promise((resolve) => {
            this.messageQueue.once(type, resolve);
        });
    }
    private disconnect() {
        this.connection.close();
    }
}

export default Client;
