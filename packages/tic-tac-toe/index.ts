import { Server } from '@prisel/server';
import TicTacToe from './state';

const server = new Server({ host: '0.0.0.0', port: Number(process.env.PORT) || 3000 });
server.register(TicTacToe);
