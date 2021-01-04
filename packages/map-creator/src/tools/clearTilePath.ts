import { RefIdSymbol, Tile, World } from '@prisel/monopoly-common';

function isEmptyPath(path: Exclude<Tile['path'], undefined>) {
    return path.prev.length === 0 && path.next.length === 0;
}
export function clearTilePath(tile: Tile, world: World) {
    if (!tile.path) {
        return;
    }
    for (const prevRef of tile.path.prev) {
        const prevTile = prevRef();
        if (prevTile && prevTile.path) {
            prevTile.path.next = prevTile.path.next.filter(
                (tileRef) => tileRef[RefIdSymbol] !== tile.id,
            );
            if (isEmptyPath(prevTile.path)) {
                delete prevTile.path;
            }
        }
    }

    for (const nextRef of tile.path.next) {
        const nextTile = nextRef();
        if (nextTile && nextTile.path) {
            nextTile.path.prev = nextTile.path.prev.filter(
                (tileRef) => tileRef[RefIdSymbol] !== tile.id,
            );
            if (isEmptyPath(nextTile.path)) {
                delete nextTile.path;
            }
        }
    }
    delete tile.path;
}
