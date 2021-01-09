import { Tile, World } from '@prisel/monopoly-common';

export function clearTilePath(tile: Tile, world: World) {
    if (tile.prev.length === 0 && tile.next.length === 0) {
        return;
    }
    for (const prevRef of tile.prev) {
        const prevTile = prevRef.get();
        if (prevTile) {
            prevTile.next = prevTile.next.filter((tileRef) => tileRef.id !== tile.id);
        }
    }

    for (const nextRef of tile.next) {
        const nextTile = nextRef.get();
        if (nextTile) {
            nextTile.prev = nextTile.prev.filter((tileRef) => tileRef.id !== tile.id);
        }
    }
}
