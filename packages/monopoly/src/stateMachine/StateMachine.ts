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
import { PHASE, StateMachineState } from './StateMachineState';
import { Transition } from './transition';

export class StateMachine implements IStateMachine {
    private currentState?: StateMachineState;
    private game: Game;
    private onEnd?: () => void;
    private stateRunner = this.runStateMachine();

    constructor(game: Game) {
        this.game = game;
        this.stateRunner.next(); // the first next start running the generator function code, and stop at the first yield, waiting for input.
    }

    private getStateFromEnum(state: State): StateMachineState<any> {
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
        this.game.stateMachine = this;
        this.stateRunner.next({ state: initialState });
    }

    private *runStateMachine(): Generator<void, void, Transition<any>> {
        try {
            while (true) {
                const transition = yield;
                const nextState = this.getStateFromEnum(transition.state);
                if (this.currentState) {
                    log.info(
                        `transition from ${this.currentState?.[Symbol.toStringTag]} to ${
                            nextState[Symbol.toStringTag]
                        }`,
                    );
                } else {
                    log.info(`entering ${nextState[Symbol.toStringTag]}`);
                }
                this.currentState = nextState;
                nextState.phase = PHASE.ACTIVE;
                nextState.onEnter(transition);
            }
        } catch (e) {
            // iterator is forced returned when Game is over
            log.info('game over');
        }
    }

    public setOnEnd(onEnd: () => void) {
        this.onEnd = onEnd;
    }

    public get state(): StateMachineState | undefined {
        return this.currentState;
    }
    public end() {
        StateMachine.exitState(assertExist(this.currentState));
        this.currentState = undefined;
        if (exist(this.onEnd)) {
            setImmediate(() => {
                this.onEnd?.();
                this.stateRunner.return();
            });
        }
    }

    private static exitState(state: StateMachineState) {
        state.phase = PHASE.EXITING;
        state.onExit();
        state.phase = PHASE.EXITTED;
    }

    public transition<T>(transition: Transition<T>) {
        // use setImmediate to make sure any task in the eventqueue is flushed.
        // There could be thing left when we have additional statements after
        // transition, for example:
        // ```
        // this.transition({state: State.MOVED});
        // return true
        // ```
        setImmediate(() => {
            const previousState = this.currentState;
            if (previousState) {
                StateMachine.exitState(previousState);
            } else {
                log.warn('no previous state to transition from.');
            }
            this.stateRunner.next(transition);
        });
    }
}
