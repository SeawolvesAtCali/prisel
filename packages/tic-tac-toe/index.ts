import { Server } from '@prisel/server';
import { TicTacToe } from './gameConfig';

Server.create({
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
    gameConfig: TicTacToe,
});
