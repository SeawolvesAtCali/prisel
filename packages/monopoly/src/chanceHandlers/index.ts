import { ChanceInputArgs } from '@prisel/monopoly-common';
import { debug } from '@prisel/server';
import { cashExchangeHandler } from './CashExchangeHandler';
import { ChanceHandler } from './ChanceHander';
import { moveStepsHandler } from './MoveStepsHandler';
import { moveToTileHandler } from './MoveToTileHandler';

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
