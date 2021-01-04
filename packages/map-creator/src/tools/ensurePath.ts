import { Mixins, Tile } from '@prisel/monopoly-common';

export function ensurePath(tile: Tile): Tile & Mixins.PathMixin {
    if (!tile.path) {
        tile.path = {
            prev: [],
            next: [],
        };
    }

    return tile as Tile & Mixins.PathMixin;
}
