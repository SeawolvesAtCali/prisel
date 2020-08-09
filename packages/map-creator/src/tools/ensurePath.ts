import { Mixins, Tile2 } from '@prisel/monopoly-common';

export function ensurePath(tile: Tile2): Tile2 & Mixins.PathMixin {
    if (!tile.path) {
        tile.path = {
            prev: [],
            next: [],
        };
    }

    return tile as Tile2 & Mixins.PathMixin;
}
