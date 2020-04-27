import Game from '../Game';
import { StateMachineState } from './StateMachineState';

export class StateMachine {
    private currentState: StateMachineState;
    private game: Game;
    constructor(game: Game) {
        this.game = game;
    }

    public init(initialStateClass: { new (game: Game, machine: StateMachine): StateMachineState }) {
        this.currentState = new initialStateClass(this.game, this);
    }

    public get state(): StateMachineState {
        return this.currentState;
    }

    public transition(stateClass: { new (game: Game, machine: StateMachine): StateMachineState }) {
        setImmediate(() => {
            this.currentState = new stateClass(this.game, this);
        });
    }
}
