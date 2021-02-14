import { RequestManager } from '@prisel/common';
import WebSocket from 'ws';
import { Player } from '../player';
import { Room } from '../room';
import SocketManager from '../socketManager';
import { FullGameConfig, GameConfig } from '../utils/gameConfig';
import { FullRoomConfig, RoomConfig } from '../utils/roomConfig';

export interface Context {
    SocketManager: SocketManager;
    server: WebSocket.Server;
    rooms: Map<string, Room>;
    players: Map<string, Player>;
    newRequestId(): any;
    requests: RequestManager;
    gameConfig: FullGameConfig;
    roomConfig: FullRoomConfig;
}

export interface ContextWithPartialConfig extends Omit<Context, 'gameConfig' | 'roomConfig'> {
    gameConfig: GameConfig;
    roomConfig: RoomConfig;
}
