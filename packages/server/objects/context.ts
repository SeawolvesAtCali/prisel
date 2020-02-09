import SocketManager from '../socketManager';
import WebSocket from 'ws';
import { GameConfig } from '../utils/gameConfig';
import { RoomConfig } from '../utils/roomConfig';
import { Room } from '../room';
import { Player } from '../player';
import { RequestManager } from '@prisel/common/requestManager';

export interface Context {
    SocketManager: SocketManager;
    server: WebSocket.Server;
    rooms: Map<string, Room>;
    players: Map<string, Player>;
    newRequestId(): any;
    gameConfig: GameConfig;
    roomConfig: RoomConfig;
    requests: RequestManager;
}
