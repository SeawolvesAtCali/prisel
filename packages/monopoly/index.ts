import { Server } from '@prisel/server';
import Monopoly from './src/gameConfig';
import RoomConfig from './src/roomConfig';

Server.create({
    gameConfig: Monopoly,
    roomConfig: RoomConfig,
    host: 'localhost',
    port: 3000,
});
