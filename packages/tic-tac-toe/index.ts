import { Server } from '@prisel/server';
import TicTacToe from './state';

const server = new Server({ host: 'localhost', port: Number(process.env.PORT) || 3000 });
server.register(TicTacToe);
