import { tic_tac_toepb } from '@prisel/protos';
import { Server, typeRegistry } from '@prisel/server';
import { TicTacToeState } from './ticTacToeState';

typeRegistry.push(tic_tac_toepb.GameStatePayload, tic_tac_toepb.MovePayload);
Server.create({
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 3000,
    onCreateGame: ({ turnOrder }) => {
        if (turnOrder.size != 2) {
            return {
                message: 'unmet player count requirement',
                detail: 'tic tac toe needs exactly 2 players',
            };
        }
        return () => TicTacToeState({ turnOrder });
    },
});
