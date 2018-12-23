import clientHandlerRegister from '@monopoly/server/lib/clientHandlerRegister';
import { Context, Socket, Server } from '@monopoly/server';
import { broadcast } from '@monopoly/server/lib/networkUtils';
import { Messages } from '@monopoly/server';
import { RoomType, GameType } from '@monopoly/common';
import debug from 'debug';
function createGameState() {
    const state: any = {
        player: [undefined, undefined],
        map: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 0,
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
    broadcast(context, roomId, ...Messages.getSuccess(RoomType.GAME_START, {}));
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

export const handleMoveImpl = (context: Context, roomId: string, moveData: any) => {
    context.updateState((draftState) => {
        const { gameState } = draftState.rooms[roomId];
        const sign = gameState.currentPlayer === 0 ? 'O' : 'X';
        gameState.map[moveData.index] = sign;
        gameState.currentPlayer = 1 - gameState.currentPlayer;
    });
    return context.StateManager.rooms[roomId].gameState;
};
export const handleMove = (context: Context, client: any) => (data: any) => {
    const { SocketManager, StateManager, updateState } = context;
    const roomId = getRoomId(context, client);
    const state = StateManager.rooms[roomId].gameState;
    const userId = SocketManager.getId(client);
    if (userId !== state.player[state.currentPlayer]) {
        return;
    }
    const newState = handleMoveImpl(context, roomId, data);

    broadcast(context, roomId, ...Messages.getGameState(newState));

    if (checkWin(newState)) {
        process.stdout.write(userId + ' won the game');
        return;
    }

    if (isEven(newState.map)) {
        process.stdout.write('EVEN');
    }
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

clientHandlerRegister.push([RoomType.GAME_START, handleGameStart]);
clientHandlerRegister.push([GameType.MOVE, handleMove]);

const server = new Server();
server.start();
