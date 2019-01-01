import { Context, Socket, Server } from '@monopoly/server';
import { broadcast, emit } from '@monopoly/server/networkUtils';
import { Messages } from '@monopoly/server';
import { RoomType, GameType } from '@monopoly/common';
import { State, Card, generateDeck, Status } from './components';
import clientHandlerRegister from '@monopoly/server/clientHandlerRegister';

function createGameState() {
    const state: State = {
        prevPlayer: 0,
        currentPlayer: 0,
        playedCard: [],
        players: [],
        deck: generateDeck(),
    };
    return state;
}

const getRoomId = (context: Context, client: Socket) => {
    const { SocketManager, StateManager } = context;
    const userId = SocketManager.getId(client);
    const roomId = StateManager.connections[userId].roomId;
    return roomId;
};

function dialCards(cardPool: Card[], playerNum: number) {
    // Math.floor(Math.random() * Math.floor(max)
    const playerCardSet: any = [];
    const dialCount = 13 * playerNum;
    for (let i = 0; i < dialCount; i++) {
        const dialIdx = Math.floor(Math.random() * Math.floor(52 - i));
        playerCardSet[i % playerNum] = playerCardSet[i % playerNum] || [];
        playerCardSet[i % playerNum].push(cardPool[dialIdx]);
        cardPool.splice(dialIdx, 1);
    }
    for (const cards of playerCardSet) {
        cards.sort((a: Card, b: Card) => {
            return a.priority - b.priority;
        });
    }
    return playerCardSet;
}

function getFirstPlayer(playerCardSets: [Card[]]) {
    // tslint:disable-next-line:prefer-for-of
    let leastPriority = 52;
    let firstPlayerIdx = 0;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < playerCardSets.length; i++) {
        if (playerCardSets[i][0].priority < leastPriority) {
            leastPriority = playerCardSets[i][0].priority;
            firstPlayerIdx = i;
        }
    }
    return firstPlayerIdx;
}

function broadcastBig2State(context: Context, messageType: string, state: State) {
    const { SocketManager } = context;
    const currentPlayer = state.currentPlayer;
    for (const player of state.players) {
        const playerSocket = SocketManager.getSocket(player.client);
        if (playerSocket) {
            emit(playerSocket, messageType, {
                currentPlayer,
                playedCard: state.playedCard,
                cardSet: player.cardSet,
            });
        }
    }
}

const handleGameStart = (context: Context, client: Socket) => (data: any) => {
    const state = createGameState();
    const roomId = getRoomId(context, client);
    const { updateState } = context;
    updateState((draftState) => {
        const clients = [draftState.rooms[roomId].host, ...draftState.rooms[roomId].guests];
        const playerCardSets = dialCards(state.deck, clients.length);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < clients.length; i++) {
            state.players.push({
                client: clients[i],
                cardSet: playerCardSets[i],
                status: Status.ONPLAY,
            });
        }
        const currPlayer = getFirstPlayer(playerCardSets);
        state.currentPlayer = currPlayer;
        state.prevPlayer = currPlayer;
        draftState.rooms[roomId].gameState = state;
    });
    broadcast(context, roomId, ...Messages.getSuccess(RoomType.GAME_START, {}));
    const newState = context.StateManager.rooms[roomId].gameState;
    broadcastBig2State(context, roomId, newState);
};

function playCard(state: State, playIndies: number[]) {
    const playerCardSet = state.players[state.currentPlayer].cardSet;
    if (playIndies.length === 0 || playIndies[0] === null) {
        return [];
    }
    playIndies = [].slice.call(playIndies).sort((a: number, b: number) => {
        return b - a;
    });
    const playedCard = [];
    for (const i of playIndies) {
        playedCard.push(playerCardSet.splice(i, 1)[0]);
    }
    return playedCard;
}

function setNextPlayer(draftState: any, roomId: string) {
    const { gameState } = draftState.rooms[roomId];
    let nextPlayer = gameState.currentPlayer;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < gameState.players.length; i++) {
        nextPlayer = (nextPlayer + 1) % gameState.players.length;
        if (gameState.players[nextPlayer].status === Status.ONPLAY) {
            break;
        }
    }
    gameState.currentPlayer = nextPlayer;
}

/*  data format:
    {
        cards : [<cards' indies of the cardSet array>],
    }
*/
const handleMove = (context: Context, client: any) => (data: any) => {
    process.stdout.write('on move  ' + data.cards.length);
    const { SocketManager, StateManager, updateState } = context;
    const roomId = getRoomId(context, client);
    const state = StateManager.rooms[roomId].gameState;
    const userId = SocketManager.getId(client);

    // only currentPlayer can make move
    if (userId !== state.players[state.currentPlayer].client) {
        return;
    }

    // currentPlayer skip the turn, update only the currentPlayer of gameState to next
    if (data.cards.length === 0 || data.cards[0] === null) {
        // round starter can't skip the turn
        if (state.currPlayer === state.prevPlayer) {
            return;
        }
        updateState((draftState) => {
            setNextPlayer(draftState, roomId);
        });
        broadcastBig2State(context, 'GameState', context.StateManager.rooms[roomId].gameState);
        return;
    }

    if (!isValidPlay(state, data.cards)) {
        return;
    }

    const playcard = playCard(state, data.cards);
    updateState((draftState) => {
        const { gameState } = draftState.rooms[roomId];
        gameState.playedCard = playcard;
        gameState.players[gameState.currentPlayer].cardSet =
            state.players[state.currentPlayer].cardSet;
        gameState.prevPlayer = gameState.currentPlayer;
        setNextPlayer(draftState, roomId);
    });
    const newState = context.StateManager.rooms[roomId].gameState;
    broadcastBig2State(context, 'GameState', newState);
    if (checkWin(newState)) {
    }
};

function isValidPlay(state: State, playIndies: number[]) {
    const playerCardSet = state.players[state.currentPlayer].cardSet;

    return true;
}

function checkWin(state: State) {
    return false;
}

clientHandlerRegister.push([RoomType.GAME_START, handleGameStart]);
clientHandlerRegister.push([GameType.MOVE, handleMove]);

const server = new Server();
server.start();
