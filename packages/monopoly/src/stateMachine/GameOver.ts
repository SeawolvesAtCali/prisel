import { Action, exist, GamePlayer, Property } from '@prisel/monopoly-common';
import { announce_game_over_spec, rank } from '@prisel/protos';
import { Packet, Request } from '@prisel/server';
import { StateMachineState } from './StateMachineState';
import { Sync, syncGamePlayer } from './utils';

export class GameOver extends StateMachineState {
    private sync?: Sync;
    public async onEnter() {
        this.sync = syncGamePlayer(this.game);
        this.game.broadcast(
            Packet.forAction(Action.ANNOUNCE_GAME_OVER)
                .setPayload(announce_game_over_spec.AnnounceGameOverPayload, {
                    ranks: this.computeRanks(),
                })
                .build(),
        );
    }

    private computeProperties() {
        const playerPropertiesWorth = new Map<string, number>();

        for (const player of this.game.players.keys()) {
            playerPropertiesWorth.set(player, 0);
        }
        for (const property of this.game.world.getAll(Property)) {
            if (exist(property.owner) && playerPropertiesWorth.has(property.owner.get().id)) {
                playerPropertiesWorth.set(
                    property.owner.get().id,
                    (playerPropertiesWorth.get(property.owner.get().id) || 0) + property.getWorth(),
                );
            }
        }
        return playerPropertiesWorth;
    }
    private computeRanks(): rank.Rank[] {
        const propertiesWorthMap = this.computeProperties();
        return Array.from(this.game.players.values())
            .map((player) => ({
                player: player.getGamePlayerInfo(),
                assets: {
                    cash: player.money,
                    property: propertiesWorthMap.get(player.id),
                    total: player.money + (propertiesWorthMap.get(player.id) || 0),
                },
            }))
            .sort((playerA, playerB) => {
                if (playerA.assets.cash !== playerB.assets.cash) {
                    return playerA.assets.cash - playerB.assets.cash;
                }
                return (playerA.assets.property || 0) - (playerB.assets.property || 0);
            });
    }

    public onPacket(packet: Packet, gamePlayer: GamePlayer): boolean {
        if (Request.isRequest(packet) && Packet.getAction(packet) === Action.BACK_TO_ROOM) {
            gamePlayer.player.respond(packet);
            if (this.sync?.add(gamePlayer.id)) {
                this.end();
            }
            return true;
        }
        return false;
    }

    public onPlayerLeave(gamePlayer: GamePlayer) {
        if (this.sync?.isSynced()) {
            this.end();
        }
    }

    public get [Symbol.toStringTag](): string {
        return 'GameOver';
    }
}
