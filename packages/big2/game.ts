import { GameConfig, Handle, debug } from '@prisel/server';
import { State, Card, generateDeck, Status, Pattern } from './components';

function dialCards(cardPool: Card[], playerNum: number) {
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

function broadcastBig2State(handle: Handle, state: State) {
    const currentPlayer = state.currentPlayer;
    state.players.forEach((player) => {
        handle.emit(player.client, {
            currentPlayer,
            playedCard: state.playedCard,
            cardSet: player.cardSet,
        });
    });
}

function playCard(state: State, playIndies: number[]) {
    const playerCardSet = state.players[state.currentPlayer].cardSet;
    if (playIndies.length === 0) {
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

function setNextPlayer(gameState: State) {
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
const handleMove = (handle: Handle, userId: string, data: any) => {
    const state = handle.state;

    debug(' !! ---- curr: ' + state.currentPlayer + 'prev: ' + state.prevPlayer + ' ---- !!');
    // only currentPlayer can make move
    if (userId !== state.players[state.currentPlayer].client) {
        debug(" !! ---- it's not your turn ---- !!");
        return;
    }

    // currentPlayer skip the turn, update only the currentPlayer of gameState to next
    if (data.cards.length === 0) {
        // round starter can't skip the turn
        if (state.currentPlayer === state.prevPlayer) {
            return;
        }
        const newGameState = handle.setState<State>((draftState) => {
            setNextPlayer(draftState);
        });

        broadcastBig2State(handle, newGameState);
        return;
    }

    if (!isValidPlay(handle.state as State, data.cards)) {
        debug(' !!! --- not a valid play --- !!!');
        return;
    }

    const new2GameState = handle.setState<State>((gameState) => {
        const playcard = playCard(gameState, data.cards);
        gameState.playedCard = playcard;
        gameState.players[gameState.currentPlayer].cardSet =
            state.players[state.currentPlayer].cardSet;
        gameState.prevPlayer = gameState.currentPlayer;
        setNextPlayer(gameState);
    });
    broadcastBig2State(handle, new2GameState);
    if (checkWin(new2GameState.players[new2GameState.prevPlayer].cardSet)) {
        debug(new2GameState.players[new2GameState.prevPlayer].client + ' won the game');
    }
};

function isValidPlay(state: State, playIndies: number[]) {
    const playerCardSet = state.players[state.currentPlayer].cardSet;
    for (const i of playIndies) {
        if (i > playerCardSet.length - 1) {
            debug('!! --- player does not have the card --- !!');
            return false;
        }
    }
    const candidates = [];
    const orderedPlayIndies = [].slice.call(playIndies).sort((a: number, b: number) => {
        return b - a;
    });
    for (const i of orderedPlayIndies) {
        candidates.push(playerCardSet[i]);
    }
    const currentPattern = getPattern(candidates);
    if (currentPattern.type === Pattern.INVALID) {
        debug('!! --- not a valid pattern --- !!');
        return false;
    }
    if (state.currentPlayer === state.prevPlayer) {
        return true;
    }
    const prevPattern = getPattern(state.playedCard);
    if (
        currentPattern.type !== prevPattern.type ||
        currentPattern.priority < prevPattern.priority
    ) {
        return false;
    }
    return true;
}

function getPriority(cards: Card[]) {
    let priority = -1;
    for (const card of cards) {
        if (card.priority > priority) {
            priority = card.priority;
        }
    }
    return priority;
}

function getPattern(cards: Card[]) {
    const hierarchy = getPriority(cards);
    if (cards.length === 1) {
        return { type: Pattern.SINGLE, priority: hierarchy };
    } else if (cards.length === 2) {
        if (cards[0].rank === cards[1].rank) {
            return {
                type: Pattern.PAIR,
                priority: hierarchy,
            };
        }
        return { type: Pattern.INVALID, priority: -1 };
    } else if (cards.length === 3) {
        if (cards[0].rank === cards[1].rank && cards[0].rank === cards[2].rank) {
            return { type: Pattern.THREE, priority: hierarchy };
        }
        return { type: Pattern.INVALID, priority: -1 };
    } else if (cards.length === 5) {
        if (isStraightFlush(cards)) {
            return { type: Pattern.FIVE, priority: getPriorityForStraight(cards) + 500 };
        } else if (isFourOfAKind(cards)) {
            return { type: Pattern.FIVE, priority: cards[2].priority + 400 };
        } else if (isFullHouse(cards)) {
            return { type: Pattern.FIVE, priority: cards[2].priority + 300 };
        } else if (isFlush(cards)) {
            return { type: Pattern.FIVE, priority: cards[0].priority + 200 };
        } else if (isStraight(cards)) {
            return { type: Pattern.FIVE, priority: getPriorityForStraight(cards) + 100 };
        } else {
            return { type: Pattern.INVALID, priority: -1 };
        }
    } else {
        return { type: Pattern.INVALID, priority: -1 };
    }
}

function getPriorityForStraight(cards: Card[]) {
    if (cards[4].rank === 3 && cards[0].rank === 2) {
        if (cards[1].rank === 1) {
            return cards[2].priority;
        }
        if (cards[1].rank === 6) {
            return cards[1].priority;
        }
    }
    return getPriority(cards);
}
function isStraight(cards: Card[]) {
    for (let i = 4; i > 0; i--) {
        if ((cards[i].rank % 13) + 1 !== cards[i - 1].rank) {
            return false;
        }
    }
    if (cards[4].rank === 11 || cards[4].rank === 12 || cards[4].rank === 13) {
        return false;
    }
    return true;
}
function isFlush(cards: Card[]) {
    if (
        cards[0].suit !== cards[1].suit ||
        cards[0].suit !== cards[2].suit ||
        cards[0].suit !== cards[3].suit ||
        cards[0].suit !== cards[4].suit
    ) {
        return false;
    }
    return true;
}
function isFullHouse(cards: Card[]) {
    if (cards[0].rank !== cards[1].rank || cards[3].rank !== cards[4].rank) {
        return false;
    }
    if (cards[2].rank !== cards[1].rank && cards[2].rank !== cards[3].rank) {
        return false;
    }
    return true;
}
function isFourOfAKind(cards: Card[]) {
    if (cards[1].rank !== cards[2].rank || cards[1].rank !== cards[3].rank) {
        return false;
    }
    if (cards[0].rank !== cards[2].rank && cards[2].rank !== cards[4].rank) {
        return false;
    }
    return true;
}
function isStraightFlush(cards: Card[]) {
    if (isFlush(cards) && isStraight(cards)) {
        return true;
    }
    return false;
}

function checkWin(playerCardSet: Card[]) {
    if (playerCardSet.length === 0) {
        return true;
    }
    return false;
}

const Big2: GameConfig = {
    type: 'big2',
    onStart(handle) {
        const gameState = handle.setState<State>((draftState) => {
            draftState.playedCard = [];
            draftState.deck = generateDeck();
            const playerCardSets = dialCards(draftState.deck, handle.players.length);
            draftState.players = handle.players.map((player, index) => {
                return {
                    client: player,
                    cardSet: playerCardSets[index],
                    status: Status.ONPLAY,
                };
            });
            draftState.currentPlayer = getFirstPlayer(playerCardSets);
            draftState.prevPlayer = draftState.currentPlayer;
        });
        broadcastBig2State(handle, gameState);
    },
    onMessage: handleMove,
};

export default Big2;
