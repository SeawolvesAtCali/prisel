import {
    ChanceInput,
    ChanceInputArgs,
    MoneyExchangeDirection,
    MoneyExchangeType,
} from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';

export function chanceInitializer<T extends keyof ChanceInputArgs>(
    type: T,
): ChanceInput<any> | null {
    switch (type) {
        case 'move_to_tile':
            const moveToTile: ChanceInput<'move_to_tile'> = {
                display: {
                    title: 'move to tile',
                    description: 'Move to a tile immediately',
                },
                type: 'move_to_tile',
                inputArgs: {
                    tileId: '',
                    isTeleport: false,
                },
            };
            return moveToTile;
        case 'move_steps':
            const moveSteps: ChanceInput<'move_steps'> = {
                display: {
                    title: 'move steps',
                    description: 'Move steps',
                },
                type: 'move_steps',
                inputArgs: {
                    steps: 1,
                },
            };
            return moveSteps;
        case 'money_exchange':
            const cashExchange: ChanceInput<'money_exchange'> = {
                display: {
                    title: 'cash exchange',
                    description: 'give or take cash',
                },
                type: 'money_exchange',
                inputArgs: {
                    direction: MoneyExchangeDirection.FROM_BANK,
                    type: MoneyExchangeType.DEFAULT,
                    amount: 0,
                },
            };
            return cashExchange;
        case 'collectible':
            const collectable: ChanceInput<'collectible'> = {
                display: {
                    title: 'collectible',
                    description: "add something to player's possession",
                },
                type: 'collectible',
                inputArgs: {
                    type: monopolypb.CollectibleExtra_CollectibleType.GET_OUT_OF_JAIL_FREE,
                },
            };
            return collectable;
    }
    return null;
}
