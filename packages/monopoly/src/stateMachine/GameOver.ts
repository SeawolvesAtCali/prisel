import { Action, GameOverPayload, Property, Rank } from '@prisel/monopoly-common';
import { broadcast, isRequest, Packet, PacketType } from '@prisel/server';
import { GamePlayer } from '../gameObjects/GamePlayer';
import { StateMachineState } from './StateMachineState';
import { Sync, syncGamePlayer } from './utils';

export class GameOver extends StateMachineState {
    private sync: Sync;
    public async onEnter() {
        this.sync = syncGamePlayer(this.game);
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
        for (const property of this.game.world.getAll(Property)) {
            if (property.owner && playerPropertiesWorth.has(property.owner.id)) {
                playerPropertiesWorth.set(
                    property.owner.id,
                    playerPropertiesWorth.get(property.owner.id) + property.getWorth(),
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
            gamePlayer.player.respond(packet);
            if (this.sync.add(gamePlayer.id)) {
                this.end();
            }
            return true;
        }
        return false;
    }

    public onPlayerLeave(gamePlayer: GamePlayer) {
        if (this.sync.isSynced()) {
            this.end();
        }
    }

    public get [Symbol.toStringTag](): string {
        return 'GameOver';
    }
}
