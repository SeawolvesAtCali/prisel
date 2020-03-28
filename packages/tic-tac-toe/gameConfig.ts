import { GameConfig, debug, broadcast, Packet, PacketType } from '@prisel/server';

interface GameState {
    player: string[];
    map: string[];
    currentPlayer: number;
    winner: string;
}

const GAME_STATE = 'GAME_STATE';
export const TicTacToe: GameConfig = {
    type: 'tic-tac-toe',
    canStart(room) {
        debug('checking canStart, the players are ', room.getPlayers().length);
        return room.getPlayers().length === 2;
    },
    onEnd(room) {
        room.removeAllGamePacketListener();
    },
    onStart(room) {
        const stopListenForMessage = room.listenGamePacket('MESSAGE', (player, packet) => {
            debug('tic-tac-toe receive game message ', packet);
            const gameState = room.getGame<GameState>();
            if (gameState.winner !== null) {
                // game already finished
                return;
            }
            if (player.getId() !== gameState.player[gameState.currentPlayer]) {
                return;
            }
            const sign = gameState.currentPlayer === 0 ? 'O' : 'X';
            const newGameState = {
                ...gameState,
            };
            newGameState.currentPlayer = 1 - gameState.currentPlayer;
            newGameState.map = gameState.map.slice();
            const newMove = packet.payload;
            if (newMove < 9 && newMove >= 0 && gameState.map[newMove] === '') {
                newGameState.map[packet.payload] = sign;
            }
            let gameOver = false;
            if (checkWin(newGameState)) {
                newGameState.winner = gameState.player[gameState.currentPlayer];
                gameOver = true;
            } else if (isEven(newGameState.map)) {
                newGameState.winner = 'even';
                gameOver = true;
            }
            const newGameStateMessage: Packet<GameState> = {
                type: PacketType.DEFAULT,
                action: GAME_STATE,
                payload: newGameState,
            };
            room.setGame(newGameState);
            broadcast(room.getPlayers(), newGameStateMessage);
            if (gameOver) {
                stopListenForMessage();
                // end the game 500 ms later to allow clients to paint the last move
                setTimeout(() => {
                    const gameOverMessage: Packet = {
                        type: PacketType.DEFAULT,
                        action: 'GAME_OVER',
                    };
                    broadcast(room.getPlayers(), gameOverMessage);
                    room.endGame();
                }, 500);
            }
        });

        room.setGame<GameState>({
            player: room.getPlayers().map((player) => player.getId()),
            map: new Array(9).fill(''),
            currentPlayer: 0,
            winner: null,
        });
        const gameStateMessage: Packet<GameState> = {
            type: PacketType.DEFAULT,
            action: GAME_STATE,
            payload: room.getGame<GameState>(),
        };
        broadcast(room.getPlayers(), gameStateMessage);
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