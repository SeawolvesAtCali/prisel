import { Client, Messages, Packet } from '@prisel/client';
import { Message } from '../LogPanel';

export type AddToLogs = (message: Message) => void;
export interface ClientState {
    username: string;
    connecting: boolean;
    loggingIn: boolean;
    loggedIn: boolean;
    userId: string;
}

type PacketListener = (packet: Packet) => void;
class DebuggerClient extends Client<ClientState> {
    private onEmit: PacketListener;
    private onPacket: PacketListener;

    constructor(onEmit: PacketListener, onPacket: PacketListener) {
        super();
        this.onEmit = onEmit;
        this.onPacket = onPacket;
    }
    // override
    public emit<P extends Packet = any>(packet: P) {
        if (this.onEmit) {
            this.onEmit(packet);
        }
        return super.emit(packet);
    }

    // override
    protected processPacket(packet: Packet) {
        if (this.onPacket) {
            this.onPacket(packet);
        }
        return super.processPacket(packet);
    }
}

export function createClient(
    username: string,
    onEmit: (packet: Packet) => void,
    onPacket: (packet: Packet) => void,
): Client {
    const client = new DebuggerClient(onEmit, onPacket);
    client.setState({ username, connecting: false, loggingIn: false, loggedIn: false });
    return client;
}

export async function connect(client: Client<ClientState>) {
    if (client.isConnected || client.state.connecting) {
        return client;
    }
    client.setState({
        connecting: true,
    });
    await client.connect();

    if (client.isConnected) {
        client.setState({ connecting: false });
        return client;
    }
    throw new Error('client cannot connect');
}

export async function login(client: Client<ClientState>): Promise<Client<ClientState>> {
    if (!client.isConnected || client.state.loggingIn || client.state.userId) {
        return Promise.resolve(client);
    }
    const username = client.state.username || 'unnamed';

    const loginResponse = await client.request(Messages.getLogin(client.newId(), username));

    if (Packet.isStatusOk(loginResponse) && Packet.hasPayload(loginResponse, 'loginResponse')) {
        client.setState({
            loggingIn: false,
            userId: Packet.getPayload(loginResponse, 'loginResponse')?.userId,
        });
        return client;
    }
    throw new Error('client cannot login');
}

export async function createRoom(client: Client<ClientState>) {
    const response = await client.request(Messages.getCreateRoom(client.newId(), 'default-room'));

    if (Packet.isStatusOk(response) && Packet.hasPayload(response, 'createRoomResponse')) {
        return Packet.getPayload(response, 'createRoomResponse')?.room?.id;
    }

    throw new Error('createRoom error: ' + response.status.message);
}

export async function joinRoom(client: Client<ClientState>, roomId: string) {
    const response = await client.request(Messages.getJoin(client.newId(), roomId));
    if (Packet.isStatusFailed(response)) {
        throw new Error('joinRoom error: ' + Packet.getStatusMessage(response));
    }
}
