import { Client } from './client';
import { Room } from './room';

export interface StateManager {
    connections: { [id: string]: Client };
    messages: string[];
    rooms: { [roomId: string]: Room };
}
