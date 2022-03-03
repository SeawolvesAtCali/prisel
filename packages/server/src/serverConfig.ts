import { StateFunc } from '@prisel/state';
import http from 'http';
import { CreateGameStatus } from './objects/createGameStatus';
import { Player } from './player';
import { TurnOrder } from './turnOrder';

export enum RoomType {
    DEFAULT = 0, // single room
    MULTI = 1,
}
export type CreateGame = (props: {
    turnOrder: TurnOrder;
    // players: { current: Player[] };
}) => StateFunc | CreateGameStatus;

export type CreateTurnOrder = (players: Player[]) => TurnOrder;

export interface ServerConfig {
    host?: string;
    port?: number;
    server?: http.Server;
    roomType?: RoomType;
    onClose?: () => void;
    onCreateGame: CreateGame;
    onCreateTurnOrder?: CreateTurnOrder;
}
