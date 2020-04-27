import { Action, PlayerRollPayload, RollResponsePayload } from '../../common/messages';
import { Packet, isRequest, broadcast, PacketType } from '@prisel/server';
import { GamePlayer } from '../GamePlayer';
import { StateMachineState } from './StateMachineState';
import { Moved } from './Moved';

export class PreRoll extends StateMachineState {
    // override
    public onPacket(packet: Packet, gamePlayer: GamePlayer) {
        const action = packet.action;
        switch (action) {
            case Action.ROLL:
                if (isRequest(packet) && this.game.isCurrentPlayer(gamePlayer)) {
                    const pathCoordinates = gamePlayer.rollAndMove();
                    gamePlayer.player.respond<RollResponsePayload>(packet, {
                        steps: pathCoordinates.length,
                        path: pathCoordinates,
                    });

                    // notify other players about current player's move
                    broadcast<PlayerRollPayload>(this.game.room.getPlayers(), (playerInGame) => ({
                        type: PacketType.DEFAULT,
                        action: Action.ANNOUNCE_ROLL,
                        payload: {
                            id: gamePlayer.id,
                            steps: pathCoordinates.length,
                            path: pathCoordinates,
                            myMoney: this.game.getGamePlayer(playerInGame).cash,
                        },
                    }));

                    this.machine.transition(Moved);
                    return true;
                }
        }
        return false;
    }
    public get [Symbol.toStringTag]() {
        return 'PreRoll';
    }
}
