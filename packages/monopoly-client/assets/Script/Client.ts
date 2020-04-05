import { Client } from './packages/priselClient';
export const client = new Client<ClientState>('ws://localhost:3000');
client.setState({
    isInRoom: false,
});

export interface ClientState {
    roomId?: string;
    roomName?: string;
    isInRoom?: boolean;
    id?: string;
    name?: string;
}
