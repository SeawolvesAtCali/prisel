import { ChanceInput, CollectableType } from '@prisel/monopoly-common';
import { ChanceInputArgs, CashExchangeDirection } from '@prisel/monopoly-common';

function checkType<T extends keyof ChanceInputArgs>(a: ChanceInput<T>): ChanceInput<T> {
    return a;
}

export const chanceList: Array<ChanceInput<keyof ChanceInputArgs>> = [
    checkType<'move_to_tile'>({
        display: {
            title: 'Move to start',
            description: 'Move to start',
        },
        type: 'move_to_tile',
        inputArgs: {
            tileId: '122', // TODO not hard code
        },
    }),
    checkType<'cash_exchange'>({
        display: {
            title: 'Pay everyone 50',
            description: 'Pay everyone 50',
        },
        type: 'cash_exchange',
        inputArgs: {
            direction: CashExchangeDirection.TO_ALL_OTHER_PLAYERS,
            amount: 50,
        },
    }),
    checkType<'move_steps'>({
        display: {
            title: 'Move back 3 steps',
            description: 'Move back 3 steps',
        },
        type: 'move_steps',
        inputArgs: {
            steps: -3,
        },
    }),
    checkType<'collectable'>({
        display: {
            title: 'get out of jail free',
            description: 'You can hold this card for use later',
        },
        type: 'collectable',
        inputArgs: {
            type: CollectableType.GET_OUT_OF_JAIL_FREE,
        },
    }),
];
