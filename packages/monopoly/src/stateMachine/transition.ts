import { State } from './stateEnum';

export interface Transition<T = void> {
    state: State;
    extra?: T;
}
