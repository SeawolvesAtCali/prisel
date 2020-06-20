import Game from '../Game';
import { Packet, broadcast } from '@prisel/server';
import { GamePlayer } from '../GamePlayer';
import { StateMachine } from './StateMachine';
import { AnimationPayload } from '@prisel/monopoly-common';

export abstract class StateMachineState {
    protected game: Game;
    private machine: StateMachine;
    constructor(game: Game, machine: StateMachine) {
        this.game = game;
        this.machine = machine;
    }
    /**
     * Called by state to verify that if it is the current state.
     * state can still be running even if it is not a current state if we have
     * some async operation that is not terminated when transition.
     */
    protected isCurrentState(): boolean {
        return this.machine.state === this;
    }
    public onEnter(): Promise<void> | void {}
    public onExit() {}
    public onPacket(packet: Packet, gamePlayer: GamePlayer): boolean {
        return false;
    }
    public onPlayerLeave(gamePlayer: GamePlayer) {}
    // implement this for state name
    public abstract get [Symbol.toStringTag](): string;

    protected transition(state: new (game: Game, machine: StateMachine) => StateMachineState) {
        if (this.isCurrentState()) {
            this.machine.transition(state);
        }
    }
    protected end() {
        this.machine.end();
    }

    protected get broadcastAnimation(): (packet: Packet<AnimationPayload>) => void {
        return (packet: Packet<AnimationPayload>) => {
            if (packet === null || packet === undefined) {
                throw new Error('cannot broadcast animation, found ' + packet);
            }
            broadcast(this.game.room.getPlayers(), packet);
        };
    }
}
