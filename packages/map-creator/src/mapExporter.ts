import {
    BoardSetup,
    Tile,
    CoordinatePair,
    TileType,
    Coordinate,
    StartTile,
    RoadTile,
    isRoadTile,
    isStartTile,
} from '@prisel/monopoly';

const toKey = (tile: Coordinate) => `${tile.row}-${tile.col}`;

// mutating tiles
export function toBoardSetup(
    tiles: Tile[],
    width: number,
    height: number,
    paths: CoordinatePair[],
): BoardSetup {
    const tileMap: Map<string, RoadTile | StartTile> = new Map();
    for (const tile of tiles) {
        if (isRoadTile(tile) || isStartTile(tile)) {
            tileMap.set(toKey(tile.pos), tile);
        }
    }

    // go through paths and add the connections
    for (const path of paths) {
        const fromTile = tileMap.get(toKey(path[0]));
        const toTile = tileMap.get(toKey(path[1]));
        if (fromTile && toTile) {
            fromTile.next.push(toTile.pos);
            toTile.prev.push(fromTile.pos);
        } else {
            throw new Error(`cannot get tile for ${toKey(path[0])} or ${toKey(path[1])}`);
        }
    }

    // sort tiles from smaller row to larger row, smaller col to larger col.
    // Making it easier to render further tiles first
    tiles.sort((tile1, tile2) => {
        if (tile1.pos.row !== tile2.pos.row) {
            return tile1.pos.row - tile2.pos.row;
        }
        return tile1.pos.col - tile2.pos.col;
    });

    // TODO populate road property mapping.
    // Run through all properties, see if there are road next to it, if there
    // is, create a mapping

    return {
        tiles,
        width,
        height,
        roadPropertyMapping: [],
    };
}
