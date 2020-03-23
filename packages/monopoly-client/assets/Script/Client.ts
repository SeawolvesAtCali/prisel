import { Client } from './packages/client/prisel.umd.js';
export const client = new Client<ClientState>('ws://localhost:3000');
client.setState({
    isInRoom: false,
});

export interface ClientState {
    roomId?: string;
    roomName?: string;
    isInRoom?: boolean;
}
