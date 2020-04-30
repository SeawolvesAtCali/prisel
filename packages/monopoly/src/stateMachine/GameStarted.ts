import { StateMachineState } from './StateMachineState';
import { Packet, isRequest, isPacket } from '@prisel/server';
import { Action, InitialStatePayload } from '../../common/messages';
import { GamePlayer } from '../GamePlayer';
import { PreRoll } from './PreRoll';

export class GameStarted extends StateMachineState {
    private syncSet = new Set<string>();

    public onPacket(packet: Packet, gamePlayer: GamePlayer): boolean {
        switch (packet.action) {
            case Action.GET_INITIAL_STATE:
                if (isRequest(packet)) {
                    gamePlayer.player.respond<InitialStatePayload>(packet, {
                        gamePlayers: Array.from(this.game.players.values()).map((player) => ({
                            money: player.cash,
                            player: {
                                name: player.player.getName(),
                                id: player.player.getId(),
                            },
                            pos: player.pathNode.tile.pos,
                            character: player.character,
                        })),
                        firstPlayerId: this.game.getCurrentPlayer().id,
                    });
                }

                return true;
            case Action.READY_TO_START_TURN:
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
        return 'GameStarted';
    }
}
