import { State } from './stateEnum';
import type { StateMachineState } from './StateMachineState';
import { Transition } from './transition';

export interface IStateMachine {
    /**
     * Initialize the state machine
     * @param initialState
     */
    init(initialState: State): void;
    /**
     * Set callback to run when state ends
     * @param onEnd
     */
    setOnEnd(onEnd: () => void): void;
    /**
     * Current state
     */
    state: StateMachineState | undefined;
    /**
     * Ends the current state. Also exit the state machine.
     */
    end(): void;
    /**
     * Transition to another state, this will end the current state and start a
     * new state. oldState.onExit will be called before the new state is
     * constructed, and newState.onEnter.
     * @param state
     */
    transition<T = void>(transition: Transition<T>): void;
}
