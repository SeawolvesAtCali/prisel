import Game from '../Game';
import { ChanceInputArgs, ChanceInput } from '@prisel/monopoly-common';
import { StateMachineConstructor } from '../stateMachine/StateMachineState';

export type ChanceHandler<T extends keyof ChanceInputArgs> = (
    game: Game,
    chanceInput: ChanceInput<T>,
) => Promise<StateMachineConstructor | void>;
