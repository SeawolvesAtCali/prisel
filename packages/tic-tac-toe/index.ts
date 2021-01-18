import { tic_tac_toepb } from '@prisel/protos';
import { Server, typeRegistry } from '@prisel/server';
import { TicTacToe } from './gameConfig';

typeRegistry.push(tic_tac_toepb.GameStatePayload, tic_tac_toepb.MovePayload);
Server.create({
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
    gameConfig: TicTacToe,
});
