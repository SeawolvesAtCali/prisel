import { Coordinate, PropertyInfo, GamePlayerInfo, Encounter } from './types';

export enum Action {
    UNSPECIFIED = '',

    // request/response
    // initiate from client
    DEBUG = 'debug',

    // request/response
    // initiate from client
    ROLL = 'roll',

    // request/response
    // initiate from client
    PURCHASE = 'purchase',

    // request/response
    // initiate from client
    END_TURN = 'endturn',

    // initiate from client, to report ready to receive game packet
    SETUP_FINISHED = 'setup_finished',

    // from server
    // broadcast initial game state
    INITIAL_STATE = 'initial_state',

    // from client. After receiving ANNOUNCE_END_TURN, client should flush any
    // animation about current player, and pan view to the next player. Then
    // send READY_TO_START_TURN to server. Server will synchronize and broadcase
    // ANNOUNCE_START_TURN to all clients.
    READY_TO_START_TURN = 'ready_to_start_turn',

    // packet to annouce a player to start a turn.
    ANNOUNCE_START_TURN = 'announce_start_turn',
    ANNOUNCE_ROLL = 'announce_roll',
    ANNOUNCE_PURCHASE = 'announce_purchase',
    ANNOUNCE_PAY_RENT = 'announce_payrent',
    // packet to announce a player finished turn.
    // this immediately follows END_TURN response from current player. After
    // receiving this packet, Other players should send back READY_TO_START_TURN
    // when they finish animations of current player and pan to the next player.
    ANNOUNCE_END_TURN = 'announce_end_turn',
}

export interface RollResponsePayload {
    path: Coordinate[]; // not including the current position
    encounters: Encounter[];
}

export interface PurchasePayload {
    propertyPos: Coordinate;
}

export interface PurchaseResponsePayload {
    property: PropertyInfo;
    remainingMoney: number;
}

export interface PlayerEndTurnPayload {
    currentPlayerId: string;
    nextPlayerId: string;
}

export interface PlayerStartTurnPayload {
    id: string;
}

export interface PlayerPurchasePayload {
    id: string;
    property: PropertyInfo;
}

export interface PlayerRollPayload {
    id: string;
    path: Coordinate[];
    encounters: Encounter[];
}

export interface PlayerPayRentPayload {
    id: string;
    rentPayment: number;
    property: PropertyInfo;
}

export interface InitialStatePayload {
    gamePlayers: GamePlayerInfo[];
    firstPlayerId?: string;
}

// Server Client
// <= SETUP_FINISHED
// => INITIAL_STATE

// <= READY_TO_START_TURN

// => PLAYER_START_TURN (first player)
// <- ROLL
// -> ROLL response, including charge, new property info
// => ANNOUNCE_ROLL
// <- PURCHASE
// -> PURCHASE response
// => ANNOUNC_PURCHASE
// <- END_TURN
// -> END_TURN response
// => PLAYER_END_TURN
// <= READY_TO_START_TURN

// => PLAYER_START_TURN (second player)
// <- ROLL
// (assuming this player need to pay rent)
// -> ROLL response, including charge
//
// ...
// => PLAYER_BANKRUPT
