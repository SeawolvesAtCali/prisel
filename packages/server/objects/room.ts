export type RoomId = string;
import { ClientId } from './client';
export interface Room {
    id: RoomId;
    name: string;
    host: ClientId;
    guests: ClientId[];
}
