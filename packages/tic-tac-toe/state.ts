import { GameConfig, AnyObject, debug } from '@prisel/server';
import { Messages } from '@prisel/server';

interface GameState {
    player: string[];
    map: string[];
    currentPlayer: number;
    winner: string;
}
const TicTacToe: Partial<GameConfig> = {
    type: 'tic-tac-toe',
    canStart(handle) {
        debug('checking canStart, the players are ', handle.players);
        return handle.players.length === 2;
    },
    onStart(handle) {
        const gameState = handle.setState<GameState>({
            player: handle.players,
            map: ['', '', '', '', '', '', '', '', ''],
            currentPlayer: 0,
            winner: null,
        });
        const gameStateMessage = Messages.getGameState(gameState);
        handle.broadcast(handle.players, ...gameStateMessage);
    },
    onMessage(handle, player, data) {
        const gameState = handle.state;
        if (gameState.winner !== null) {
            // game already finished
            return;
        }
        if (player !== gameState.player[gameState.currentPlayer]) {
            return;
        }
        const newGameState = handle.setState<AnyObject>((draftState) => {
            const sign = draftState.currentPlayer === 0 ? 'O' : 'X';
            draftState.map[data.index] = sign;
            if (checkWin(draftState)) {
                draftState.winner = draftState.currentPlayer;
            } else if (isEven(draftState.map)) {
                draftState.winner = 'even';
            }
            draftState.currentPlayer = 1 - draftState.currentPlayer;
        });

        handle.broadcast(handle.players, ...Messages.getGameState(newGameState));
    },
};

export const isEven = (map: string[]) => {
    const hasEmpty = map.some((element: string) => {
        return element === '';
    });
    return !hasEmpty;
};

export function checkWin(state: any) {
    for (let i = 0; i < 3; i++) {
        if (
            state.map[3 * i] !== '' &&
            state.map[3 * i] === state.map[3 * i + 1] &&
            state.map[3 * i] === state.map[3 * i + 2]
        ) {
            debug('win');
            return true;
        }
        if (
            state.map[i] !== '' &&
            state.map[i] === state.map[i + 3] &&
            state.map[i] === state.map[i + 6]
        ) {
            debug('win');
            return true;
        }
    }
    if (state.map[0] !== '' && state.map[0] === state.map[4] && state.map[0] === state.map[8]) {
        return true;
    }
    if (state.map[2] !== '' && state.map[2] === state.map[4] && state.map[2] === state.map[6]) {
        return true;
    }
    return false;
}

export default TicTacToe;
