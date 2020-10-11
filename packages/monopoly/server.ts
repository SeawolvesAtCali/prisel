// run server in production using node
import { Server } from '@prisel/server';
import { readFileSync } from 'fs';
import './src/flags';
import Monopoly from './src/gameConfig';
import RoomConfig from './src/roomConfig';

const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_PORT = '80';

const { HOST = DEFAULT_HOST, HOST_FILE, PORT = DEFAULT_PORT, PORT_FILE } = process.env;

const host: string = HOST_FILE ? readFileSync(HOST_FILE).toString() : HOST;
const port: number = parseInt(PORT_FILE ? readFileSync(PORT_FILE).toString() : PORT, 10);

Server.create({
    gameConfig: Monopoly,
    roomConfig: RoomConfig,
    host,
    port,
});
