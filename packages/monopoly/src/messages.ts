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
}

export interface RollReponsePayload {
    steps: number;
    // TODO add path
    // TODO add destination result (fine/rent/ new house for purchase)
}

export interface PurchaseResponsePayload {
    cost: number;
    rent: number;
}
