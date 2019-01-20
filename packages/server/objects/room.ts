export type RoomId = string;
import { ClientId } from './client';
import { GAME_PHASE } from './gamePhase';
export interface Room {
    id: RoomId;
    name: string;
    host?: ClientId;
    players: ClientId[];
    gamePhase: GAME_PHASE;
    gameState?: any;
}
