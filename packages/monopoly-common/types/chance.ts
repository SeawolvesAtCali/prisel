import { ChanceArgs } from '../chanceSpec';

export interface ChanceDescription {
    title: string;
    description: string;
    image?: string;
}

export interface Chance<T extends keyof ChanceArgs> {
    description: ChanceDescription;
    type: T;
    args: ChanceArgs[T];
}
