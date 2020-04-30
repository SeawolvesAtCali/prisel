import { StateMachineState } from './StateMachineState';
import { Packet } from '@prisel/server';
import { Action } from '../../common/messages';
import { GamePlayer } from '../GamePlayer';
import { PreRoll } from './PreRoll';

export class PreTurn extends StateMachineState {
    private syncSet = new Set<string>();
    public onPacket(packet: Packet, gamePlayer: GamePlayer): boolean {
        if (packet.action === Action.READY_TO_START_TURN) {
            this.syncSet.add(gamePlayer.id);
            if (this.checkSynced()) {
                this.machine.transition(PreRoll);
            }
            return true;
        }
        return false;
    }

    public onPlayerLeave(gamePlayer: GamePlayer) {
        if (this.checkSynced()) {
            this.machine.transition(PreRoll);
        }
    }

    private checkSynced(): boolean {
        for (const playerInGame of this.game.players.keys()) {
            if (!this.syncSet.has(playerInGame)) {
                return false;
            }
        }
        return true;
    }

    public get [Symbol.toStringTag]() {
        return 'PreTurn';
    }
}
