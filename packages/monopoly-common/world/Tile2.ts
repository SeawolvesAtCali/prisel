import { getRand } from '../getRand';
import { createClass } from './createClass';
import { ChancePoolMixinConfig } from './mixins/ChancePoolMixin';
import { HasPropertiesMixinConfig } from './mixins/HasPropertiesMixin';
import { required } from './mixins/MixinConfig';
import { PathMixinConfig } from './mixins/PathMixin';
import { PositionMixinConfig } from './mixins/PositionMixin';
import { StartMixinConfig } from './mixins/StartMixin';

export const TileClass = createClass('tile', [
    required(PositionMixinConfig),
    PathMixinConfig,
    HasPropertiesMixinConfig,
    StartMixinConfig,
    ChancePoolMixinConfig,
]);

export type Tile2 = InstanceType<typeof TileClass>;

/**
 * generate path not including current node using genNextPathNode funtion.If
 * the function return undefined, generation is stopped.
 */
export const Tiles = {
    genPathWith(
        tile: Tile2,
        getNextPathNode: (currentPathNode: Tile2, length: number) => Tile2 | undefined,
    ): Tile2[] {
        const path: Tile2[] = [];
        let current: Tile2 = tile;
        while (true) {
            const next = getNextPathNode(current, path.length);
            if (next) {
                path.push(next);
                current = next;
            } else {
                break;
            }
        }
        return path;
    },

    genPath(tile: Tile2, steps: number) {
        return Tiles.genPathWith(tile, (current, length) =>
            length === steps
                ? undefined
                : // Choose a random next
                  getRand(current.path?.next ?? [])?.() ?? undefined,
        );
    },

    genPathReverse(tile: Tile2, steps: number) {
        return Tiles.genPathWith(tile, (current, length) =>
            length === steps
                ? undefined
                : // Choose a random next
                  getRand(current.path?.prev ?? [])?.() ?? undefined,
        );
    },
};
