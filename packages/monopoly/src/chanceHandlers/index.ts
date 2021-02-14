import { ChanceInputArgs } from '@prisel/monopoly-common';
import { log } from '../log';
import { ChanceHandler } from './ChanceHandler';
import { collectibleHandler } from './CollectibleHandler';
import { moneyExchangeHandler } from './MoneyExchangeHandler';
import { moveStepsHandler } from './MoveStepsHandler';
import { moveToTileHandler } from './MoveToTileHandler';

export const chanceHandlers: Record<keyof ChanceInputArgs, ChanceHandler<any>> = {
    unspecified: async () => {
        log.error('unspecified handler not implemented');
    },
    move_to_tile: moveToTileHandler,
    money_exchange: moneyExchangeHandler,
    move_steps: moveStepsHandler,
    collectible: collectibleHandler,
};
