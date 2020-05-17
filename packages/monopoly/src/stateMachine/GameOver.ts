import { StateMachineState } from './StateMachineState';
import { broadcast, PacketType, Packet, Request, isRequest } from '@prisel/server';
import { GameOverPayload, Action } from '../../common/messages';
import { Rank } from '../../common/types';
import { GamePlayer } from '../GamePlayer';

export class GameOver extends StateMachineState {
    private syncSet = new Set<string>();

    public async onEnter() {
        broadcast<GameOverPayload>(this.game.room.getPlayers(), {
            type: PacketType.DEFAULT,
            action: Action.ANNOUNCE_GAME_OVER,
            payload: {
                ranks: this.computeRanks(),
            },
        });
    }

    private computeProperties() {
        const playerPropertiesWorth = new Map<string, number>();

        for (const player of this.game.players.keys()) {
            playerPropertiesWorth.set(player, 0);
        }
        for (const property of this.game.properties) {
            if (property.owner && playerPropertiesWorth.has(property.owner.id)) {
                playerPropertiesWorth.set(
                    property.owner.id,
                    playerPropertiesWorth.get(property.owner.id) + property.cost,
                );
            }
        }
        return playerPropertiesWorth;
    }
    private computeRanks(): Rank[] {
        const propertiesWorthMap = this.computeProperties();
        return Array.from(this.game.players.values())
            .map((player) => ({
                player: {
                    name: player.player.getName(),
                    id: player.player.getId(),
                },
                character: player.character,
                assets: {
                    cash: player.cash,
                    property: propertiesWorthMap.get(player.id),
                    total: player.cash + propertiesWorthMap.get(player.id),
                },
            }))
            .sort((playerA, playerB) => {
                if (playerA.assets.cash !== playerB.assets.cash) {
                    return playerA.assets.cash - playerB.assets.cash;
                }
                return playerA.assets.property - playerB.assets.property;
            });
    }

    public onPacket(packet: Packet, gamePlayer: GamePlayer): boolean {
        if (isRequest(packet) && packet.action === Action.BACK_TO_ROOM) {
            this.syncSet.add(gamePlayer.id);
            gamePlayer.player.respond(packet);
            if (this.checkSynced()) {
                this.machine.end();
            }
            return true;
        }
        return false;
    }

    public onPlayerLeave(gamePlayer: GamePlayer) {
        if (this.checkSynced()) {
            this.machine.end();
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

    public get [Symbol.toStringTag](): string {
        return 'GameOver';
    }
}
