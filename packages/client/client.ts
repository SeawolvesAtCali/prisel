import once from 'lodash/once';
import { getLogin, getExit } from './message';
import {
    SERVER,
    newRequestManager,
    Packet,
    RequestManager,
    Request,
    Response,
    PacketType,
    LoginResponsePayload,
    isResponse,
    MessageType,
    RoomChangePayload,
    Code,
    ResponseWrapper,
} from '@prisel/common';
import { PubSub } from './pubSub';
import withTimer from './withTimer';

const DEFAULT_USERNAME = 'user';

type RemoveListenerFunc = () => void;

const DEFAULT_TIMEOUT = 5000;
const CONNECTION_TIMEOUT = DEFAULT_TIMEOUT;

export interface State {
    [property: string]: unknown;
}

export function serialize(packet: Packet): string {
    return JSON.stringify(packet);
}

export function deserialize(buffer: string): Packet | void {
    try {
        return JSON.parse(buffer) as Packet;
    } catch {
        // tslint:disable-next-line:no-console
        console.log('Error parsing packet: ' + buffer);
    }
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
    private requestManager: RequestManager;
    private listeners = new PubSub();
    private systemActionListener = new PubSub();
    private onEmitCallback: (packet: Packet) => void;

    constructor(server: string = SERVER) {
        this.state = {};
        this.serverUri = server;
        this.requestManager = newRequestManager();
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
        // TODO if it is already connecting, we should also exit
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
            this.emit(getExit());
            this.disconnect();
        }
    }

    private listenForSystemAction<Payload = never>(
        systemAction: MessageType,
        listener: (payload: Payload) => void,
    ): RemoveListenerFunc {
        return this.systemActionListener.on(systemAction, (packet) => listener(packet.payload));
    }

    /**
     * Login to server using the username specified.
     * Throw error if not connected, or don't have controller namespace.
     * @param {string} username username to login with
     */
    public async login(username: string = DEFAULT_USERNAME): Promise<LoginResponsePayload> {
        if (this.isConnected) {
            const response: ResponseWrapper<LoginResponsePayload> = await this.request(
                getLogin(this.requestManager.newId(), username),
            );
            return response.payload;
        }
        throw Client.CONNECTION_CLOSED;
    }

    /**
     * Emit to server
     * @param messageType
     * @param data
     */
    public emit<P extends Packet = any>(packet: P) {
        if (this.isConnected) {
            this.connection.send(serialize(packet));
            if (this.onEmitCallback) {
                this.onEmitCallback(packet);
            }
        } else {
            throw Client.CONNECTION_CLOSED;
        }
    }

    public request<Payload = any>(request: Request<Payload>) {
        this.emit(request);
        return this.requestManager.addRequest(request, DEFAULT_TIMEOUT).catch(() => {
            throw Client.CONNECTION_CLOSED;
        });
    }

    public respond<Payload>(request: Request, payload: Payload) {
        const response: Response<Payload> = {
            type: PacketType.RESPONSE,
            request_id: request.request_id,
            status: {
                code: Code.OK,
            },
            payload,
        };
        if (request.system_action !== undefined) {
            response.system_action = request.system_action;
        }
        if (request.action !== undefined) {
            response.action = request.action;
        }
        this.emit(response);
    }

    public respondFailure(request: Request, message?: string, detail?: any) {
        const response: Response<never> = {
            type: PacketType.RESPONSE,
            request_id: request.request_id,
            status: {
                code: Code.FAILED,
            },
        };
        if (message) {
            response.status.message = message;
        }
        if (detail !== undefined) {
            response.status.detail = detail;
        }
        this.emit(response);
    }

    /**
     * Attach handler for messages from server
     * @param messageTypeOrFilter
     * @param callback
     */
    public on(action: any, listener: (packet: Packet, action?: any) => void): RemoveListenerFunc {
        return this.listeners.on(action, listener);
    }

    public onRoomStateChange(
        listener: (roomStateChange: RoomChangePayload) => void,
    ): RemoveListenerFunc {
        return this.listenForSystemAction<RoomChangePayload>(
            MessageType.ROOM_STATE_CHANGE,
            listener,
        );
    }

    public onGameStart(listener: () => void): RemoveListenerFunc {
        return this.listenForSystemAction(MessageType.ANNOUNCE_GAME_START, listener);
    }

    /**
     * Set the client state
     * @param newState new state object to replace the old state
     */
    public setState(newState: Partial<T>) {
        this.state = { ...this.state, ...newState };
    }

    public newId() {
        return this.requestManager.newId();
    }

    protected processPacket(packet: Packet) {
        if (isResponse(packet)) {
            // handle response using requestManager
            this.requestManager.onResponse(packet);
            return;
        }

        if (packet.action !== undefined) {
            this.listeners.dispatch(packet.action, packet);
        } else if (packet.system_action !== undefined) {
            this.systemActionListener.dispatch(packet.system_action, packet);
        } else {
            this.log('Packet without action is not supported', packet);
        }
    }

    private handleMessage(rawMessage: string) {
        if (this.isConnected) {
            const message = deserialize(rawMessage);
            if (!message) {
                return;
            }
            this.processPacket(message);
        }
    }

    private disconnect() {
        if (this.isConnected) {
            this.connection.onclose = undefined;
            this.connection.close();
            this.conn = undefined;
        }
        this.listeners.close();
        this.listeners = undefined;
    }
}

export default Client;
