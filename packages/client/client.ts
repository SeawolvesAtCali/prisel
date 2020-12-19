import {
    newRequestManager,
    Packet,
    Request,
    RequestManager,
    Response,
    SERVER,
} from '@prisel/common';
import { packet, payload, room_state_change_spec, system_action_type } from '@prisel/protos';
import once from 'lodash/once';
import { assert } from './assert';
import { getExit } from './message';
import { PubSub } from './pubSub';
import withTimer from './withTimer';

type RemoveListenerFunc = () => void;

const DEFAULT_TIMEOUT = 5000;
const CONNECTION_TIMEOUT = DEFAULT_TIMEOUT;

export interface State {
    [property: string]: unknown;
}

export function serialize(pkt: Packet) {
    return packet.Packet.encode(pkt).finish();
}

export function deserialize(buffer: any): Packet | undefined {
    if (buffer instanceof ArrayBuffer) {
        return packet.Packet.decode(new Uint8Array(buffer));
    } else if (buffer instanceof Uint8Array) {
        return packet.Packet.decode(buffer);
    }
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
        return this.conn;
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
            new Promise((resolve) => {
                const onOpen = () => {
                    this.conn = connection;
                    resolve(undefined);
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
        systemAction: system_action_type.SystemActionType,
        listener: (payload?: payload.Payload) => void,
    ): RemoveListenerFunc {
        return this.systemActionListener.on(systemAction, (packet) => listener(packet.payload));
    }

    /**
     * Emit to server
     * @param messageType
     * @param data
     */
    public emit<P extends Packet = any>(packet: P) {
        assert(this.isConnected, NOT_CONNECTED);
        this.connection.send(serialize(packet));
        if (this.onEmitCallback) {
            this.onEmitCallback(packet);
        }
    }

    public async request(request: Request) {
        this.emit(request);
        return this.requestManager.addRequest(request, DEFAULT_TIMEOUT);
    }

    public respond(response: Response) {
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
        listener: (roomStateChange: room_state_change_spec.RoomStateChangePayload) => void,
    ): RemoveListenerFunc {
        return this.listenForSystemAction(
            system_action_type.SystemActionType.ROOM_STATE_CHANGE,
            (payload) => {
                if (payload.payload.$case === 'roomStateChangePayload') {
                    listener(payload.payload.roomStateChangePayload);
                }
            },
        );
    }

    public onGameStart(listener: () => void): RemoveListenerFunc {
        return this.listenForSystemAction(system_action_type.SystemActionType.GAME_START, listener);
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

        if (Packet.isSystemAction(packet)) {
            this.systemActionListener.dispatch(packet.message.systemAction, packet);
        } else if (Packet.isCustomAction(packet)) {
            this.listeners.dispatch(packet.message.action, packet);
        } else {
            this.log('Packet without action is not supported', packet);
        }
    }

    private handleMessage(rawMessage: any) {
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
