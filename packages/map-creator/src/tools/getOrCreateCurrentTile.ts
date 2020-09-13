import { Coordinate, TileClass, World } from '@prisel/monopoly-common';
import { equal } from '../common';

export function getOrCreateCurrentTile(coor: Coordinate, world: World) {
    const tile =
        world.getAll(TileClass).find((tile) => equal(tile.position, coor)) ||
        world.create(TileClass);
    tile.position = coor;
    if (!tile.check()) {
        throw new Error('tile incomplete');
    }
    return tile;
}
