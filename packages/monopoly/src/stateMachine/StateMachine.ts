import { log } from '@prisel/monopoly-common';
import Game from '../Game';
import { StateMachineState } from './StateMachineState';

export class StateMachine {
    private currentState: StateMachineState;
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

    public get state(): StateMachineState {
        return this.currentState;
    }
    public end() {
        this.currentState.onExit();
        this.currentState = null;
        setImmediate(this.onEnd);
    }

    public transition(stateClass: { new (game: Game, machine: StateMachine): StateMachineState }) {
        setImmediate(() => {
            const previousState = this.currentState;
            previousState.onExit();
            this.currentState = new stateClass(this.game, this);
            log.info(
                `transition from ${previousState[Symbol.toStringTag]} to ${
                    this.currentState[Symbol.toStringTag]
                }`,
            );
            this.currentState.onEnter();
        });
    }
}
