import Game from '../Game';

export interface Sync {
    isSynced: () => boolean;
    add(playerId: string): boolean;
}

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

    return {
        isSynced,
        add,
    };
}
