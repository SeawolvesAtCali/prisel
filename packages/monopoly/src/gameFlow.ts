import Game from './Game';
import {
    Room,
    PacketType,
    broadcast,
    Request,
    wrapResponse,
    Packet,
    ResponseWrapper,
} from '@prisel/server';
import {
    Action,
    PlayerPurchasePayload,
    PlayerRollPayload,
    RollResponsePayload,
} from '../common/messages';

export function syncAllPlayer(game: Game, action: Action): Promise<void> {
    return new Promise((resolve) => {
        const syncedSet = new Set<string>();
        const room = game.room;
        const off = room.listenGamePacket<Packet>(action, (player) => {
            syncedSet.add(game.getPlayerId(player));
            for (const playerInGame of game.players.keys()) {
                if (!syncedSet.has(playerInGame)) {
                    return;
                }
            }
            off();
            resolve();
        });
    });
}

export function runPlayerTurn(game: Game, room: Room): Promise<void> {
    const turn = game.turn;
    // Wait for player roll, off when player rolled
    turn.runRequestListener({
        action: Action.ROLL,
        handle(currentGame, packet, player) {
            return wrapResponse(player.roll(currentGame, packet));
        },
        postHandle(currentGame, response: ResponseWrapper<RollResponsePayload>, player) {
            if (response.ok()) {
                // notify other players about current player's move
                broadcast<PlayerRollPayload>(currentGame.room.getPlayers(), {
                    type: PacketType.DEFAULT,
                    action: Action.ANNOUNCE_ROLL,
                    payload: {
                        id: player.id,
                        steps: response.payload.path.length,
                        path: response.payload.path,
                        encounters: response.payload.encounters,
                    },
                });
            }
        },
        isDone(_, response) {
            return response.ok();
        },
    });

    // Wait for player purchase
    // player can purchase at any time (before roll or after roll or both) or
    // not purchase at all as long as the land is not purchased
    turn.runRequestListener({
        action: Action.PURCHASE,
        handle(currentGame, packet, player) {
            return wrapResponse(player.purchase(currentGame, packet));
        },
        postHandle(currentGame, response, player) {
            if (response.ok()) {
                // notify other player about the purchase
                broadcast<PlayerPurchasePayload>(currentGame.room.getPlayers(), {
                    type: PacketType.DEFAULT,
                    action: Action.ANNOUNCE_PURCHASE,
                    payload: {
                        id: player.id,
                        property: response.payload.property,
                    },
                });
            }
        },
    });

    // Wait for player end turn
    const waitForEndTurn = turn.runRequestListener({
        action: Action.END_TURN,
        handle(currentGame, packet, player) {
            return wrapResponse(player.endTurn(currentGame, packet));
        },
        isDone(_, response) {
            return response.ok();
        },
    });

    return waitForEndTurn;
}
