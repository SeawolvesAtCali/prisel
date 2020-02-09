import {
    Client,
    Messages,
    CreateRoomPayload,
    RoomInfoPayload,
    StatusPayload,
    Status,
    Packet,
} from '@prisel/client';
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
    public onEmit: PacketListener;
    public onPacket: PacketListener;
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
    const client = new DebuggerClient();
    client.onEmit = onEmit;
    client.onPacket = onPacket;
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

    const data = await client.login(username);

    if (data) {
        client.setState({
            loggingIn: false,
            userId: data.userId,
        });
        return client;
    }
    throw new Error('client cannot login');
}

export async function createRoom(client: Client<ClientState>) {
    const response = await client.request<CreateRoomPayload>(
        Messages.getCreateRoom(client.newId(), 'default-room'),
    );

    if (response.status === Status.SUCCESS) {
        return (response.payload as RoomInfoPayload).id;
    }
    throw new Error('createRoom error: ' + (response.payload as StatusPayload).detail);
}

export async function joinRoom(client: Client<ClientState>, roomId: string) {
    const response = await client.request(Messages.getJoin(client.newId(), roomId));
    if (response.status === Status.FAILURE) {
        throw new Error('joinRoom error: ' + (response.payload as StatusPayload).detail);
    }
}
