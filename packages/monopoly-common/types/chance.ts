import { ChanceArgs, ChanceInputArgs } from '../chanceSpec';

// Data required to render the Chance card on client
export interface ChanceDisplay {
    title: string;
    description: string;
    image?: string;
}

// The selected Chance card. This contains the updated game state after applying
// the chance card.
export interface Chance<T extends keyof ChanceArgs = 'unspecified'> {
    display: ChanceDisplay;
    type: T;
    args: ChanceArgs[T];
}

// Chance data generated at the begining of the game. This will be used to
// create the Chance object at runtime. ChanceInput contains property of the
// card that are not computed based on the game state.
export interface ChanceInput<T extends keyof ChanceInputArgs = 'unspecified'> {
    display: ChanceDisplay;
    type: T;
    inputArgs: ChanceInputArgs[T];
}
