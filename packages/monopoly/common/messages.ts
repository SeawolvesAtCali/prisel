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

    // initiate from client, to report finishing loading/rendering map
    SETUP_FINISHED = 'setup_finished',

    // from server
    // broadcast initial game state
    INITIAL_STATE = 'initial_state',

    // packet to annouce a player to start a turn.
    ANNOUNCE_START_TURN = 'announce_start_turn',
    ANNOUNCE_ROLL = 'announce_roll',
    ANNOUNCE_PURCHASE = 'announce_purchase',
    ANNOUNCE_PAY_RENT = 'announce_payrent',
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
}

// Server Client
// <= SETUP_FINISHED
// => INITIAL_STATE

// => PLAYER_START_TURN (first player)
// <- ROLL
// -> ROLL response, including charge, new property info
// => ANNOUNCE_ROLL
// <- PURCHASE
// -> PURCHASE response
// => ANNOUNC_PURCHASE
// <- END_TURN

// => PLAYER_START_TURN (second player)
// <- ROLL
// (assuming this player need to pay rent)
// -> ROLL response, including charge
//
// ...
// => PLAYER_BANKRUPT
