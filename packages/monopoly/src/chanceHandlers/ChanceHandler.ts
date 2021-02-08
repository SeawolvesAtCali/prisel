import { ChanceInput, ChanceInputArgs } from '@prisel/monopoly-common';
import Game from '../Game';
import { State } from '../stateMachine/stateEnum';

export type ChanceHandler<T extends keyof ChanceInputArgs> = (
    game: Game,
    chanceInput: ChanceInput<T>,
) => Promise<State | void>;
