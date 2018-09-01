// @flow
import { Client } from './client';
import { Room } from './room';

export type StateManager = {
    connections: { controllers: { [id: string]: Client }; displays: { [id: string]: Client } };
    messages: Array<string>;
    rooms: { [room_id: string]: Room };
};
