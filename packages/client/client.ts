import once from 'lodash/once';
import { SERVER } from '@prisel/common';
import { createPacket } from '@prisel/common';

import { getLogin, getExit } from './message/room';
import { MessageType } from '@prisel/common';
import PubSub, { HandlerKey } from './pubSub';
import withTimer from './withTimer';

const DEFAULT_USERNAME = 'user';

interface MessageData {
    [prop: string]: unknown;
}

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
 *      const client = new Client(serverURL); // create a client
 *
 * Creating a Client instance doesn't connect to the server, we need to call `client.connect()`
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
    public state: { [prop: string]: unknown };
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
            this.messageQueue.close();
        };

        connection.onerror = (e: any) => {
            // tslint:disable-next-line
            console.log(e);
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

        // connection.
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
            this.once(
                (messageType, data) =>
                    messageType === MessageType.SUCCESS && data.action === MessageType.LOGIN,
            ),
            LOGIN_TIMEOUT,
        );
    }

    /**
     * Emit to server
     * @param messageType
     * @param data
     */
    public emit(messageType: string, data: { [prop: string]: unknown }) {
        this.connection.send(createPacket(messageType, data));
    }

    /**
     * Attach handler for messages from server
     * @param messageTypeOrFilter
     * @param callback
     */
    public on(
        messageTypeOrFilter: HandlerKey,
        callback: (
            data: { [prop: string]: unknown },
            messageType?: string,
        ) => { [prop: string]: unknown } | void,
    ): RemoveListenerFunc {
        return this.messageQueue.on(messageTypeOrFilter, (data, messageType) => {
            const updatedState = callback(data, messageType) || this.state;
            this.state = updatedState;
        });
    }

    /**
     * Set the client state
     * @param {Object} newState new state object to replace the old state
     */
    public setState(newState: { [prop: string]: unknown }) {
        this.state = newState;
    }

    /**
     * Listen for message until receive the message once.
     * @param {HandlerKey} messageTypeOrFilter message type to listen to
     */
    public once(messageTypeOrFilter: HandlerKey): Promise<MessageData> {
        return new Promise((resolve) => {
            this.messageQueue.once(messageTypeOrFilter, resolve);
        });
    }
    private disconnect() {
        this.connection.close();
    }
}

export default Client;
