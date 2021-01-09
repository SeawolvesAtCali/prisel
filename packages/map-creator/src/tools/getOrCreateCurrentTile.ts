import { Tile, World } from '@prisel/monopoly-common';
import { coordinate } from '@prisel/protos';
import { equal } from '../common';

export function getOrCreateCurrentTile(coor: coordinate.Coordinate, world: World) {
    const tile =
        world.getAll(Tile).find((tile) => equal(tile.position, coor)) || world.create(Tile);
    tile.position = coor;
    if (!tile.check()) {
        throw new Error('tile incomplete');
    }
    return tile;
}
