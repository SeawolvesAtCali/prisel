import { exist } from '@prisel/monopoly-common';
import { assertExist, assertNever } from '@prisel/server';
import Game from '../Game';
import { log } from '../log';
import { GameOver } from './GameOver';
import { GameStarted } from './GameStarted';
import { IStateMachine } from './IStateMachine';
import { Moved } from './Moved';
import { Moving } from './Moving';
import { PreRoll } from './PreRoll';
import { State } from './stateEnum';
import { StateMachineState } from './StateMachineState';

export class StateMachine implements IStateMachine {
    private currentState?: StateMachineState;
    private game: Game;
    private onEnd?: () => void;
    constructor(game: Game) {
        this.game = game;
    }

    private getStateFromEnum(state: State): StateMachineState {
        switch (state) {
            case State.GAME_STARTED:
                return new GameStarted(this.game, this);
            case State.PRE_ROLL:
                return new PreRoll(this.game, this);
            case State.MOVING:
                return new Moving(this.game, this);
            case State.MOVED:
                return new Moved(this.game, this);
            case State.GAME_OVER:
                return new GameOver(this.game, this);
            default:
                assertNever(state);
        }
    }

    public init(initialState: State) {
        this.currentState = this.getStateFromEnum(initialState);
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
        if (exist(this.onEnd)) {
            setImmediate(this.onEnd);
        }
    }

    public transition(state: State) {
        setImmediate(() => {
            const previousState = this.currentState;
            if (previousState) {
                previousState.onExit();
            } else {
                log.warn('no previous state to transition from.');
            }
            this.currentState = this.getStateFromEnum(state);
            log.info(
                `transition from ${previousState?.[Symbol.toStringTag]} to ${
                    this.currentState[Symbol.toStringTag]
                }`,
            );
            this.currentState.onEnter();
        });
    }
}
