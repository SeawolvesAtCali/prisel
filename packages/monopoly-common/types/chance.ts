import { monopolypb } from '@prisel/protos';
import { ChanceInputArgs } from '../chanceSpec';

// Chance data generated at the begining of the game. This will be used to
// create the Chance object at runtime. ChanceInput contains property of the
// card that are not computed based on the game state.
export interface ChanceInput<T extends keyof ChanceInputArgs = 'unspecified'> {
    display: monopolypb.ChanceDisplay;
    type: T;
    inputArgs: ChanceInputArgs[T];
}
