// run server using ts-node
import { Server } from '@prisel/server';
import Monopoly from './src/gameConfig';
import RoomConfig from './src/roomConfig';
import path from 'path';

(global as any).COMMON_DATA_DIR = path.resolve(__dirname, 'common', 'data');

Server.create({
    gameConfig: Monopoly,
    roomConfig: RoomConfig,
    host: 'localhost',
    port: 3000,
});
