import Game from '../Game';
import { Packet } from '@prisel/server';
import { GamePlayer } from '../GamePlayer';
import { StateMachine } from './stateMachine';

export abstract class StateMachineState {
    protected game: Game;
    protected machine: StateMachine;
    constructor(game: Game, machine: StateMachine) {
        this.game = game;
        this.machine = machine;
    }
    public onEnter() {}
    public onPacket(packet: Packet, gamePlayer: GamePlayer): boolean {
        return false;
    }
    public onPlayerLeave(gamePlayer: GamePlayer) {}
    // implement this for state name
    public abstract get [Symbol.toStringTag](): string;
}
