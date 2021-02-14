import { Action, exist, GamePlayer, Property } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Packet, Request, Response } from '@prisel/server';
import { getPlayer } from '../utils';
import { StateMachineState } from './StateMachineState';
import { Sync, syncGamePlayer } from './utils';

export class GameOver extends StateMachineState {
    private sync?: Sync;
    public onEnter() {
        this.sync = syncGamePlayer(this.game);
        this.game.broadcast(
            Packet.forAction(Action.ANNOUNCE_GAME_OVER)
                .setPayload(monopolypb.AnnounceGameOverPayload, {
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
    private computeRanks(): monopolypb.Rank[] {
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
            getPlayer(gamePlayer).respond(Response.forRequest(packet).build());
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

    public readonly [Symbol.toStringTag] = 'GameOver';
}
