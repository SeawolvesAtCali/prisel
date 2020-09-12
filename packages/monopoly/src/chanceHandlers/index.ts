import { ChanceInputArgs, log } from '@prisel/monopoly-common';
import { cashExchangeHandler } from './CashExchangeHandler';
import { ChanceHandler } from './ChanceHander';
import { moveStepsHandler } from './MoveStepsHandler';
import { moveToTileHandler } from './MoveToTileHandler';

export const chanceHandlers: Record<keyof ChanceInputArgs, ChanceHandler<any>> = {
    unspecified: async () => {
        log.severe('unspecified handler not implemented');
    },
    move_to_tile: moveToTileHandler,
    cash_exchange: cashExchangeHandler,
    move_steps: moveStepsHandler,
    collectable: async () => {
        log.warning('collectable handler not implemented');
    },
};
