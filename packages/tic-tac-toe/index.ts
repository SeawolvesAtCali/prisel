import { Server } from '@prisel/server';
import TicTacToe from './state';

const server = new Server();
server.register(TicTacToe);
server.start();
