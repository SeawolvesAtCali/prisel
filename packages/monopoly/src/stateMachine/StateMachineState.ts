import { GamePlayer } from '@prisel/monopoly-common';
import { Packet, Token } from '@prisel/server';
import Game from '../Game';
import { log } from '../log';
import { IStateMachine } from './IStateMachine';
import { Transition } from './transition';

type PromiseOr<T> = Promise<T> | T;

export enum PHASE {
    ACTIVE = 'active',
    EXITING = 'exiting',
    EXITTED = 'exited',
}
export abstract class StateMachineState<InputType = void> {
    protected game: Game;
    private machine: IStateMachine;
    // private pendingTransition?: State;
    protected token: Token; // cancellation token

    private phase_ = PHASE.ACTIVE;
    public get phase() {
        return this.phase_;
    }
    public set phase(value: PHASE) {
        log.info(`State ${this[Symbol.toStringTag]} enters ${this.phase_} phase`);
        this.phase_ = value;
    }

    constructor(game: Game, machine: IStateMachine) {
        this.game = game;
        this.machine = machine;
        this.token = Token.get();
    }

    /**
     * Called when entering the state.
     * @param transition The previous transition that causes state to reach
     * current state.
     */
    public onEnter(transition: Transition<InputType>): PromiseOr<void> {}

    public onExit() {}

    /**
     * Handles packet. Returns true if the packet is processed. This means that side
     * effect is made. Even if the packet should be rejected, it is still
     * considered processed, because error message might be returned to client.
     * Only return false if the action is not recognized.
     * @param packet
     * @param gamePlayer
     */
    public onPacket(packet: Packet, gamePlayer: GamePlayer): boolean {
        return false;
    }
    public onPlayerLeave(gamePlayer: GamePlayer) {}
    // implement this for state name
    public abstract get [Symbol.toStringTag](): string;

    protected transition<T = void>(transition: Transition<T>) {
        if (!this.token.cancelled) {
            this.token.cancel();
            this.machine.transition(transition);
        } else {
            log.info(
                `token for ${
                    this[Symbol.toStringTag]
                } already cancelled, cannot transition from it`,
            );
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

    protected async startCoroutine(generator: Generator<Promise<any>>): Promise<void> {
        if (this.token.cancelled) {
            return;
        }
        let result = undefined;
        for (
            let yielded = generator.next(result);
            !yielded.done;
            yielded = generator.next(result)
        ) {
            if (this.token.cancelled) {
                return;
            }
            if (yielded.value instanceof Promise) {
                result = await yielded.value;
            } else {
                result = yielded.value;
            }
            if (this.token.cancelled) {
                return;
            }
        }
    }
}
