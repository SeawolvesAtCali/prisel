import {
    assert,
    assertExist,
    newRequestManager,
    Packet,
    Request,
    RequestManager,
    Response,
    SERVER,
    Token,
} from '@prisel/common';
import { priselpb } from '@prisel/protos';
import once from 'lodash/once';
import { getExit } from './message';
import { PubSub } from './pubSub';
import withTimer from './withTimer';

type RemoveListenerFunc = () => void;

const DEFAULT_TIMEOUT = 5000;
const CONNECTION_TIMEOUT = DEFAULT_TIMEOUT;

export interface State {
    [property: string]: unknown;
}

const NOT_CONNECTED = 'not connected';

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
export class Client<T = State> {
    public get connection(): WebSocket {
        return assertExist(this.conn, 'connection');
    }

    public get isConnected(): boolean {
        return !!this.conn;
    }

    public state: Partial<T>;
    private conn: WebSocket | undefined;
    private serverUri: string;
    private requestManager: RequestManager;
    private listeners: PubSub | undefined = new PubSub();
    private systemActionListener = new PubSub();
    private onEmitCallback?: (packet: Packet) => void;

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
    public async connect(): Promise<WebSocket | undefined> {
        if (this.isConnected) {
            return;
        }
        // TODO if it is already connecting, we should also exit
        const connection = new WebSocket(this.serverUri);
        connection.binaryType = 'arraybuffer';

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
            new Promise<void>((resolve) => {
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

    private listenForSystemAction(
        systemAction: priselpb.SystemActionType,
        listener: (packet?: Packet) => void,
    ): RemoveListenerFunc {
        return this.systemActionListener.on(systemAction, (packet) => listener(packet));
    }

    /**
     * Emit to server
     * @param messageType
     * @param data
     */
    public emit<P extends Packet = any>(packet: P) {
        assert(this.isConnected, NOT_CONNECTED);
        assertExist(this.connection).send(Packet.serialize(packet));
        if (this.onEmitCallback) {
            this.onEmitCallback(packet);
        }
    }

    public async request(request: Request, token = Token.delay(DEFAULT_TIMEOUT)) {
        this.emit(request);
        return this.requestManager.addRequest(request, token);
    }

    public respond(response: Response) {
        this.emit(response);
    }

    /**
     * Attach handler for messages from server
     * @param action
     * @param listener
     */
    public on<T extends Packet | Response | Request>(
        action: any,
        listener: (packet: T, action?: any) => unknown,
    ): RemoveListenerFunc {
        return assertExist(this.listeners?.on(action, listener), 'pubsub');
    }

    public onRoomStateChange(
        listener: (roomStateChange: priselpb.RoomStateChangePayload) => void,
    ): RemoveListenerFunc {
        return this.listenForSystemAction(priselpb.SystemActionType.ROOM_STATE_CHANGE, (packet) => {
            const payload = Packet.getPayload(packet, 'roomStateChangePayload');
            if (payload) {
                listener(payload);
            }
        });
    }

    public onGameStart(listener: () => void): RemoveListenerFunc {
        return this.listenForSystemAction(priselpb.SystemActionType.ANNOUNCE_GAME_START, listener);
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
        if (Response.isResponse(packet)) {
            // handle response using requestManager
            this.requestManager.onResponse(packet);
            return;
        }

        if (Packet.isAnySystemAction(packet)) {
            this.systemActionListener.dispatch(packet.message.systemAction, packet);
        } else if (Packet.isAnyCustomAction(packet)) {
            this.listeners?.dispatch(packet.message.action, packet);
        } else {
            this.log('Packet without action is not supported', packet);
        }
    }

    private handleMessage(rawMessage: any) {
        if (this.isConnected) {
            const message = Packet.deserialize(rawMessage);
            if (!message) {
                return;
            }
            this.processPacket(message);
        }
    }

    private disconnect() {
        if (this.isConnected && this.connection) {
            this.connection.onclose = null;
            this.connection.close();
            this.conn = undefined;
        }
        this.listeners?.close();
        this.listeners = undefined;
    }
}
