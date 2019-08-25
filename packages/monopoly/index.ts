import { Server } from '@prisel/server';
import Monopoly from './src/gameConfig';
import RoomConfig from './src/roomConfig';

const server = new Server();
server.register(Monopoly, RoomConfig);
