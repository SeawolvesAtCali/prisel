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

export type Tile = InstanceType<typeof TileClass>;

/**
 * generate path not including current node using genNextPathTile funtion.If
 * the function return undefined, generation is stopped.
 */
export const Tiles = {
    genPathWith(
        tile: Tile,
        genNextPathTile: (currentPathTile: Tile, length: number) => Tile | undefined,
    ): Tile[] {
        const path: Tile[] = [];
        let current: Tile = tile;
        while (true) {
            const next = genNextPathTile(current, path.length);
            if (next) {
                path.push(next);
                current = next;
            } else {
                break;
            }
        }
        return path;
    },

    genPath(tile: Tile, steps: number) {
        return Tiles.genPathWith(tile, (current, length) =>
            length === steps
                ? undefined
                : // Choose a random next
                  getRand(current.path?.next ?? [])?.() ?? undefined,
        );
    },

    genPathReverse(tile: Tile, steps: number) {
        return Tiles.genPathWith(tile, (current, length) =>
            length === steps
                ? undefined
                : // Choose a random next
                  getRand(current.path?.prev ?? [])?.() ?? undefined,
        );
    },
};
