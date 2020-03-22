import { Client } from './packages/client/lib/index.d';

export const client = new Client<ClientState>('ws://localhost:3000');

client.setState({
    isInRoom: false,
});

export interface ClientState {
    roomId?: string;
    roomName?: string;
    isInRoom?: boolean;
}

export * from './packages/client/lib/index.d';
