import { Tile } from './types';
import { CollectableType } from './types/collectable';

// args to be sent to client to update the client state.
export interface ChanceArgs {
    unspecified: {};
    // move to each of the tiles sequentially and perform actions on the each
    // tiles. Normally, player would only go to one tile.
    move_to_tile: {
        tile: Tile;
    };
    // pay x some money; get some money from all players; pay bank; get from bank
    cash_exchange: {
        exchanges: {
            [playerId: string]: number;
        };
        myCurrentCash: number;
    };
    // move a specific amount of steps forward or backward
    move_steps: {
        steps: number;
    };
    // add a card to collection. For example: Get out of jail free card
    collectable: {
        type: CollectableType;
    };
}

export enum CashExchangeDirection {
    UNSPECIFIED,
    TO_ALL_OTHER_PLAYERS,
    FROM_ALL_OTHER_PLAYERS,
    FROM_BANK,
    TO_BANK,
}
export interface ChanceInputArgs {
    unspecified: {};
    move_to_tile: {
        tileId: string;
    };
    cash_exchange: {
        direction: CashExchangeDirection;
        amount: number;
    };
    move_steps: {
        steps: number;
    };
    collectable: {
        type: CollectableType;
    };
}

export const chanceInputOutputMap: Record<keyof ChanceInputArgs, keyof ChanceArgs> = {
    unspecified: 'unspecified',
    move_to_tile: 'move_to_tile',
    cash_exchange: 'cash_exchange',
    move_steps: 'move_steps',
    collectable: 'collectable',
};
