import { Tile, World } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { equal } from '../common';

export function getOrCreateCurrentTile(coor: monopolypb.Coordinate, world: World) {
    const tile =
        world.getAll(Tile).find((tile) => equal(tile.position, coor)) || world.create(Tile);
    tile.position = coor;
    if (!tile.check()) {
        throw new Error('tile incomplete');
    }
    return tile;
}
