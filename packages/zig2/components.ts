enum Suits {
    DIAMOND = 'DIAMOND',
    CLUB = 'CLUB',
    HEART = 'HEART',
    SPADE = 'SPADE',
}

export enum Pattern {
    INVALID = 'INVALID',
    SINGLE = 'SINGLE',
    PAIR = 'PAIR',
    THREE = 'THREE',
    FIVE = 'FIVE',
    // STRAIGHT = 'STRAIGHT',
    // FLUSH = 'FLUSH',
    // FULLHOUSE = 'FULLHOUSE',
    // FOUR = 'FOUR',
    // STRAIGHTFLUSH = 'STRAIGHTFLUSH',
}

export enum Status {
    ONPLAY = 'ONPLAY',
    LOST = 'LOST',
}

export function generateDeck() {
    const fullDeck = [];
    for (let i = 1; i < 14; i++) {
        fullDeck.push({ rank: i, suit: Suits.DIAMOND });
        fullDeck.push({ rank: i, suit: Suits.CLUB });
        fullDeck.push({ rank: i, suit: Suits.HEART });
        fullDeck.push({ rank: i, suit: Suits.SPADE });
    }
    setPriority(fullDeck);
    return fullDeck;
}

function setPriority(fullDeck: Card[]) {
    for (let i = 0; i < 8; i++) {
        fullDeck[i].priority = 44 + i;
    }
    for (let i = 8; i < 52; i++) {
        fullDeck[i].priority = i - 8;
    }
}

export interface Card {
    priority?: number;
    rank: number;
    suit: Suits;
}
export interface Player {
    client: string;
    money?: number;
    cardSet: Card[];
    status: Status;
}

export interface State {
    prevPlayer: number;
    currentPlayer: number;
    playedCard: Card[];
    players: Player[];
    deck: Card[];
}
