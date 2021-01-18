import { Client } from '@prisel/client';
import { getConfig } from './config';

const websocketHost = getConfig('host', 'ws://localhost:3000');

export const client = new Client<ClientState>(websocketHost);
client.setState({
    isInRoom: false,
});

export interface ClientState {
    roomId?: string;
    roomName?: string;
    isInRoom?: boolean;
    id?: string;
    gamePlayerId?: string;
    name?: string;
}
