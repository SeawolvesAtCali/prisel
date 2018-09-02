// @flow
import { Client } from './client';
import { Room } from './room';

export interface StateManager {
    connections: { controllers: { [id: string]: Client }; displays: { [id: string]: Client } };
    messages: string[];
    rooms: { [roomId: string]: Room };
}
