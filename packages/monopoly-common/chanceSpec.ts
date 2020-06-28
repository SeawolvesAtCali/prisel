import { Tile } from './types';
import { CollectableType } from './types/collectable';

// args to be sent to client to update the client state.
export interface ChanceArgs {
    unspecified: {};
    // move to each of the tiles sequentially and perform actions on the each
    // tiles. Normally, player would only go to one tile.
    move_to_tiles: {
        tiles: Tile[];
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
        finalTile: Tile;
    };
    // add a card to collection. For example: Get out of jail free card
    collectable: {
        type: CollectableType;
    };
}
