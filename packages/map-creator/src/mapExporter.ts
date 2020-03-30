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
    Walkable,
    isWalkable,
    PropertyTile,
    isPropertyTile,
} from '@prisel/monopoly';

const toKey = (tile: Coordinate) => `${tile.row}-${tile.col}`;

// mutating tiles
export function toBoardSetup(
    tiles: Tile[],
    width: number,
    height: number,
    paths: CoordinatePair[],
): BoardSetup {
    const tileMap: Map<string, Walkable & Tile> = new Map();
    const propertySet: Set<PropertyTile> = new Set();
    for (const tile of tiles) {
        if (isWalkable(tile)) {
            tileMap.set(toKey(tile.pos), tile);
        }
        if (isPropertyTile(tile)) {
            propertySet.add(tile);
        }
    }

    // go through paths and add the connections
    for (const path of paths) {
        const { 0: fromCoor, 1: toCoor } = path;
        const fromTile = tileMap.get(toKey(fromCoor));
        const toTile = tileMap.get(toKey(toCoor));
        if (fromTile && toTile) {
            fromTile.next.push(toCoor);
            toTile.prev.push(fromCoor);
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

    // Populate road property mapping.
    // Run through all properties, see if there are road next to it, if there
    // is, create a mapping
    const roadPropertyMapping: CoordinatePair[] = [];
    for (const proprety of Array.from(propertySet)) {
        const { pos } = proprety;
        for (let dRow = -1; dRow <= 1; dRow++) {
            for (let dCol = -1; dCol <= 1; dCol++) {
                if (dRow === 0 && dCol === 0) {
                    continue;
                }
                const walkable = tileMap.get(toKey({ row: pos.row + dRow, col: pos.col + dCol }));
                if (walkable) {
                    roadPropertyMapping.push([walkable.pos, pos]);
                }
            }
        }
    }

    return {
        tiles,
        width,
        height,
        roadPropertyMapping,
    };
}
