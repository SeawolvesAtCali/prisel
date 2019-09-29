import once from 'lodash/once';
import { SERVER, Payload } from '@prisel/common';
import { createPacket, isFeedback } from '@prisel/common';

import { getLogin, getExit } from './message/room';
import { MessageType } from '@prisel/common';
import PubSub, { HandlerKey } from './pubSub';
import withTimer from './withTimer';

const DEFAULT_USERNAME = 'user';

type RemoveListenerFunc = () => void;

const DEFAULT_TIMEOUT = 5000;
const CONNECTION_TIMEOUT = DEFAULT_TIMEOUT;
const LOGIN_TIMEOUT = DEFAULT_TIMEOUT;

export interface State {
    [property: string]: unknown;
}
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
class Client<T = State> {
    static get CONNECTION_CLOSED() {
        return new Error('connection closed');
    }

    public get connection(): WebSocket {
        if (this.conn) {
            return this.conn;
        }
        throw Client.CONNECTION_CLOSED;
    }

    public get isConnected(): boolean {
        return !!this.conn;
    }

    public state: Partial<T>;
    private conn: WebSocket;
    private serverUri: string;
    private onMessageListeners = new PubSub();
    private onEmitListeners = new PubSub();

    constructor(server: string = SERVER) {
        this.state = {};
        this.serverUri = server;
        this.connect = once(this.connect.bind(this));
    }

    public log(...rest: any[]): void {
        // tslint:disable-next-line:no-console
        console.log(...rest);
    }

    /**
     * Connect to server
     */
    public async connect(): Promise<WebSocket> {
        if (this.isConnected) {
            return;
        }
        const connection = new WebSocket(this.serverUri);

        connection.onclose = () => {
            this.disconnect();
        };

        connection.onerror = (e: any) => {
            // tslint:disable-next-line
            console.log(e);
        };
        connection.onmessage = (message) => {
            this.handleMessage(message.data);
        };
        await withTimer(
            new Promise((resolve, reject) => {
                const onOpen = () => {
                    this.conn = connection;
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
        if (this.isConnected) {
            this.emit(...getExit());
            this.disconnect();
        }
    }

    /**
     * Login to server using the username specified.
     * Throw error if not connected, or don't have controller namespace.
     * @param {string} username username to login with
     */
    public login(username: string = DEFAULT_USERNAME): Promise<Payload> {
        if (this.isConnected) {
            this.emit(...getLogin(username));
            return withTimer(
                this.once(
                    (messageType, data) =>
                        messageType === MessageType.SUCCESS &&
                        isFeedback(data) &&
                        data.action === MessageType.LOGIN,
                ),
                LOGIN_TIMEOUT,
            ).then((data) => {
                if (this.isConnected) {
                    return data;
                }
                throw Client.CONNECTION_CLOSED;
            });
        }
        return Promise.reject(Client.CONNECTION_CLOSED);
    }

    /**
     * Emit to server
     * @param messageType
     * @param data
     */
    public emit(messageType: MessageType, data: Payload) {
        if (this.isConnected) {
            this.connection.send(createPacket(messageType, data));
            this.onEmitListeners.dispatch(messageType, data);
        } else {
            throw Client.CONNECTION_CLOSED;
        }
    }

    public onEmit(
        messageTypeOrFilter: HandlerKey,
        callback: (data: Payload, messageType: MessageType) => void,
    ) {
        return this.onEmitListeners.on(messageTypeOrFilter, callback);
    }

    /**
     * Attach handler for messages from server
     * @param messageTypeOrFilter
     * @param callback
     */
    public on(
        messageTypeOrFilter: HandlerKey,
        callback: (data: Payload, messageType: MessageType) => void,
    ): RemoveListenerFunc {
        return this.onMessageListeners.on(messageTypeOrFilter, callback);
    }

    /**
     * Set the client state
     * @param newState new state object to replace the old state
     */
    public setState(newState: Partial<T>) {
        this.state = { ...this.state, ...newState };
    }

    /**
     * Listen for message until receive the message once.
     * @param messageTypeOrFilter message type to listen to
     */
    public once(messageTypeOrFilter: HandlerKey): Promise<Payload> {
        return new Promise((resolve) => {
            this.onMessageListeners.once(messageTypeOrFilter, resolve);
        });
    }

    private handleMessage(rawMessage: string) {
        if (this.isConnected) {
            const message = JSON.parse(rawMessage);
            this.onMessageListeners.dispatch(message.type, message.payload);
        }
    }

    private disconnect() {
        if (this.isConnected) {
            this.connection.onclose = undefined;
            this.connection.close();
            this.conn = undefined;
        }
        this.onMessageListeners.close();
        this.onMessageListeners = undefined;
    }
}

export default Client;
