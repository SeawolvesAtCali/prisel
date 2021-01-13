import { assertExist } from '@prisel/server';
import Game from '../Game';
import { log } from '../log';
import { StateMachineState } from './StateMachineState';

export class StateMachine {
    private currentState?: StateMachineState;
    private game: Game;
    private onEnd: () => void;
    constructor(game: Game) {
        this.game = game;
    }

    public init(initialStateClass: { new (game: Game, machine: StateMachine): StateMachineState }) {
        this.currentState = new initialStateClass(this.game, this);
        this.game.stateMachine = this;
        this.currentState.onEnter();
    }

    public setOnEnd(onEnd: () => void) {
        this.onEnd = onEnd;
    }

    public get state(): StateMachineState | undefined {
        return this.currentState;
    }
    public end() {
        assertExist(this.currentState).onExit();
        this.currentState = undefined;
        setImmediate(this.onEnd);
    }

    public transition(stateClass: { new (game: Game, machine: StateMachine): StateMachineState }) {
        setImmediate(() => {
            const previousState = this.currentState;
            if (previousState) {
                previousState.onExit();
            } else {
                log.warn('no previous state to transition from.');
            }
            this.currentState = new stateClass(this.game, this);
            log.info(
                `transition from ${previousState?.[Symbol.toStringTag]} to ${
                    this.currentState[Symbol.toStringTag]
                }`,
            );
            this.currentState.onEnter();
        });
    }
}
