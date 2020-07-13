import { ChanceInput, ChanceInputArgs } from '@prisel/monopoly-common';
import Game from '../Game';
import { StateMachineConstructor } from '../stateMachine/StateMachineState';

export type ChanceHandler<T extends keyof ChanceInputArgs> = (
    game: Game,
    chanceInput: ChanceInput<T>,
) => Promise<StateMachineConstructor | void>;
