import { StateFunc } from '@prisel/state';
import http from 'http';
import { CreateGameStatus } from './objects/createGameStatus';
import { Player } from './player';

export enum RoomType {
    DEFAULT = 0, // single room
    MULTI = 1,
}
export type CreateGame = (props: {
    players: { current: Player[] };
}) => StateFunc | CreateGameStatus;

export interface ServerConfig {
    host?: string;
    port?: number;
    server?: http.Server;
    roomType?: RoomType;
    onClose?: () => void;
    onCreateGame?: CreateGame;
}
