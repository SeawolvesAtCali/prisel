import { animationMap } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import Game from '../Game';
export interface Sync {
    isSynced: () => boolean;
    add(playerId: string): boolean;
    has(playerId: string): boolean;
}

/**
 * Create a set to track players in the game. When all players are added, the
 * isSynced property will become true.
 *
 * NOTE: Sync should be used rarely as we should allow players to temporarily
 * disconnect, for example, when user switch tab and the game tab is put into
 * background, the WebSocket will still receive packets but game loop is paused.
 * In that case, we cannot expect user to send back sync response.
 *
 * @param game
 */
export function syncGamePlayer(game: Game): Sync {
    const syncSet = new Set<string>();

    const isSynced = () => {
        for (const playerInGame of game.room.getPlayers().map((player) => player.getId())) {
            if (!syncSet.has(playerInGame)) {
                return false;
            }
        }
        return true;
    };

    const add = (playerId: string) => {
        syncSet.add(playerId);
        return isSynced();
    };
    const has = (playerId: string): boolean => syncSet.has(playerId);

    return {
        isSynced,
        add,
        has,
    };
}

export function getPanAnimationLength(from: monopolypb.Coordinate, to: monopolypb.Coordinate) {
    return Math.trunc(
        Math.sqrt(Math.pow(from.row - to.row, 2) + Math.pow(from.col - to.col, 2)) *
            animationMap.pan,
    );
}
