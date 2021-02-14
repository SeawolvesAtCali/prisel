import { ChanceInput, ChanceInputArgs } from '@prisel/monopoly-common';
import Game from '../Game';
import { Transition } from '../stateMachine/transition';

export type ChanceHandler<T extends keyof ChanceInputArgs> = (
    game: Game,
    chanceInput: ChanceInput<T>,
) => Promise<Transition<any> | void>;
