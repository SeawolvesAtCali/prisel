import clientHandlerRegister from '@prisel/server/lib/clientHandlerRegister';
import { Context, Socket } from '@prisel/server';
import { broadcast } from '@prisel/server/lib/utils/networkUtils';
import { Messages } from '@prisel/server';
import { MessageType } from '@prisel/common';
import debug from 'debug';
function createGameState() {
    const state: any = {
        player: [undefined, undefined],
        map: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 0,
        winner: null,
    };
    return state;
}

const getRoomId = (context: Context, client: Socket) => {
    const { SocketManager, StateManager } = context;
    const userId = SocketManager.getId(client);
    const roomId = StateManager.connections[userId].roomId;
    return roomId;
};

const handleGameStart = (context: Context, client: Socket) => (data: any) => {
    const state = createGameState();
    const roomId = getRoomId(context, client);
    const { updateState } = context;
    updateState((draftState) => {
        state.player[0] = draftState.rooms[roomId].host;
        state.player[1] = draftState.rooms[roomId].guests[0];
        draftState.rooms[roomId].gameState = state;
    });
    broadcast(context, roomId, ...Messages.getSuccess(MessageType.GAME_START, {}));
    broadcast(
        context,
        roomId,
        ...Messages.getGameState(context.StateManager.rooms[roomId].gameState),
    );
};

export const isEven = (map: string[]) => {
    const hasEmpty = map.some((element: string) => {
        return element === '';
    });
    return !hasEmpty;
};

const handleMoveImpl = (context: Context, roomId: string, moveData: any) => {
    context.updateState((draftState) => {
        const { gameState } = draftState.rooms[roomId];
        const sign = gameState.currentPlayer === 0 ? 'O' : 'X';
        gameState.map[moveData.index] = sign;
        if (checkWin(gameState)) {
            gameState.winner = gameState.currentPlayer;
        } else if (isEven(gameState.map)) {
            gameState.winner = 'even';
        }
        gameState.currentPlayer = 1 - gameState.currentPlayer;
    });
    return context.StateManager.rooms[roomId].gameState;
};
const handleMove = (context: Context, client: Socket) => (data: any) => {
    const { SocketManager, StateManager, updateState } = context;
    const roomId = getRoomId(context, client);
    const state = StateManager.rooms[roomId].gameState;
    if (state.winner !== null) {
        // game already finished
        return;
    }
    const userId = SocketManager.getId(client);
    if (userId !== state.player[state.currentPlayer]) {
        return;
    }
    const newState = handleMoveImpl(context, roomId, data);

    broadcast(context, roomId, ...Messages.getGameState(newState));
};

export function checkWin(state: any) {
    for (let i = 0; i < 3; i++) {
        if (
            state.map[3 * i] !== '' &&
            state.map[3 * i] === state.map[3 * i + 1] &&
            state.map[3 * i] === state.map[3 * i + 2]
        ) {
            debug('debug')('yes');
            return true;
        }
        if (
            state.map[i] !== '' &&
            state.map[i] === state.map[i + 3] &&
            state.map[i] === state.map[i + 6]
        ) {
            debug('debug')('yes');
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

clientHandlerRegister.push([MessageType.GAME_START, handleGameStart]);
clientHandlerRegister.push([MessageType.MOVE, handleMove]);
