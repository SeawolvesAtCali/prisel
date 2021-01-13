import { GamePlayer } from '@prisel/monopoly-common';
import { Packet } from '@prisel/server';
import Game from '../Game';
import { StateMachine } from './StateMachine';

export type StateMachineConstructor = new (game: Game, machine: StateMachine) => StateMachineState;
export abstract class StateMachineState {
    protected game: Game;
    private machine: StateMachine;
    private pendingTransition?: StateMachineConstructor;

    constructor(game: Game, machine: StateMachine) {
        this.game = game;
        this.machine = machine;
    }
    /**
     * Called by state to verify that if it is the current state.
     * state can still be running even if it is not a current state if we have
     * some async operation that is not terminated when transition.
     */
    protected isCurrent(): boolean {
        return !this.pendingTransition;
    }

    /**
     * Return true if there is already a pending State to transition to in the
     * next tick. The caller should not perform more logic because we are ready
     * to transition.
     * This function will return true even after the transition, so it can be
     * used as a catchall condition to determine if caller should perform
     * further logic.
     */
    protected isTransitioned(): boolean {
        return !!this.pendingTransition;
    }

    public onEnter(): Promise<void> | void {}
    public onExit() {}
    public onPacket(packet: Packet, gamePlayer: GamePlayer): boolean {
        return false;
    }
    public onPlayerLeave(gamePlayer: GamePlayer) {}
    // implement this for state name
    public abstract get [Symbol.toStringTag](): string;

    protected transition(state: StateMachineConstructor) {
        if (this.isCurrent()) {
            this.pendingTransition = state;
            this.machine.transition(state);
        }
    }
    protected end() {
        this.machine.end();
    }

    protected get broadcastAnimation(): (packet: Packet) => void {
        return (packet: Packet) => {
            if (packet === null || packet === undefined) {
                throw new Error('cannot broadcast animation, found ' + packet);
            }
            this.game.broadcast(packet);
        };
    }
}
