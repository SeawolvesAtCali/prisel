import {
    CashExchangeDirection,
    CashExchangeType,
    ChanceInput,
    ChanceInputArgs,
    CollectableType,
} from '@prisel/monopoly-common';

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
        case 'cash_exchange':
            const cashExchange: ChanceInput<'cash_exchange'> = {
                display: {
                    title: 'cash exchange',
                    description: 'give or take cash',
                },
                type: 'cash_exchange',
                inputArgs: {
                    direction: CashExchangeDirection.FROM_BANK,
                    type: CashExchangeType.UNSPECIFIED,
                    amount: 0,
                },
            };
            return cashExchange;
        case 'collectable':
            const collectable: ChanceInput<'collectable'> = {
                display: {
                    title: 'collectable',
                    description: "add something to player's possession",
                },
                type: 'collectable',
                inputArgs: {
                    type: CollectableType.GET_OUT_OF_JAIL_FREE,
                },
            };
            return collectable;
    }
    return null;
}
