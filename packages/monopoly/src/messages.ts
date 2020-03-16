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

    // packet to annouce a player to start a turn.
    PLAYER_START_TURN = 'player_start_turn',

    // request/response
    // initiate from client
    END_TURN = 'endturn',

    SETUP_FINISHED = 'setup_finished',

    ANNOUNCE_PLAYER_PURCHASE = 'announce_player_purchase',
}

export interface RollResponsePayload {
    steps: number;
    // TODO add path
    // TODO add destination result (fine/rent/ new house for purchase)
}

interface PurchasedPropertyInfo {
    id: string;
    cost: number;
    rent: number;
    name: string;
}
export interface PurchaseResponsePayload {
    property: PurchasedPropertyInfo;
    remaining_cash: number;
}

export interface PlayerStartTurnPayload {
    id: string;
}

export interface AnnouncePlayerPurchasePayload {
    id: string;
    property: PurchasedPropertyInfo;
}
