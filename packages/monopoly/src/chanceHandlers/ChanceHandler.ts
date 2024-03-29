import { ChanceInput, ChanceInputArgs } from '@prisel/monopoly-common';
import { TurnOrder } from '@prisel/server';
import { StateConfig, StateFunc } from '@prisel/state';

export type ChanceHandler<T extends keyof ChanceInputArgs> = StateFunc<{
    input: ChanceInput<T>;
    setNextState: (nextState: StateConfig<any>) => void;
    turnOrder: TurnOrder;
}>;
