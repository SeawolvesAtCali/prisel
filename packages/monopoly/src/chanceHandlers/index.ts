import { debug } from '@prisel/server';
import { ChanceInputArgs } from '@prisel/monopoly-common';
import { ChanceHandler } from './ChanceHander';
import { moveToTileHandler } from './MoveToTileHandler';
import { cashExchangeHandler } from './CashExchangeHandler';
import { moveStepsHandler } from './MoveStepsHandler';

export const chanceHandlers: Record<keyof ChanceInputArgs, ChanceHandler<any>> = {
    unspecified: async () => {
        debug('unspecified handler not implemented');
    },
    move_to_tile: moveToTileHandler,
    cash_exchange: cashExchangeHandler,
    move_steps: moveStepsHandler,
    collectable: async () => {
        debug('collectable handler not implemented');
    },
};
