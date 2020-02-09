import { Server } from '@prisel/server';
import { TicTacToe } from './gameConfig';

// TODO(minor) change Server to provide a factory method, so that we don't need
// to create a variable.
const server = new Server({
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
    gameConfig: TicTacToe,
});
