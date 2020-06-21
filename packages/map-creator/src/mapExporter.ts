import {
    BoardSetup,
    Tile,
    CoordinatePair,
    Coordinate,
    Walkable,
    isWalkable,
    PropertyTile,
    isPropertyTile,
} from '@prisel/monopoly-common';
import { AllFileName } from '../images';

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

    // set sprites
    for (const tile of tiles) {
        if (isWalkable(tile)) {
            tile.sprite = getRoadSprite(tile);
            continue;
        }
        if (isPropertyTile(tile)) {
            const propertyImage: AllFileName = 'property';
            tile.sprite = propertyImage;
            continue;
        }
        const defaultSprite: AllFileName = 'slice1';
        tile.sprite = defaultSprite;
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
    function addNeighborWalkable(pos: Coordinate, dRow: number, dCol: number): void {
        const walkable = tileMap.get(toKey({ row: pos.row + dRow, col: pos.col + dCol }));
        if (walkable) {
            roadPropertyMapping.push([walkable.pos, pos]);
        }
    }
    for (const property of Array.from(propertySet)) {
        // up
        addNeighborWalkable(property.pos, -1, 0);
        // down
        addNeighborWalkable(property.pos, 1, 0);
        // left
        addNeighborWalkable(property.pos, 0, -1);
        // right
        addNeighborWalkable(property.pos, 0, 1);
    }

    return {
        tiles,
        width,
        height,
        roadPropertyMapping,
    };
}
function getRoadSprite(tile: Walkable & Tile): AllFileName {
    let up = false;
    let down = false;
    let left = false;
    let right = false;
    const pos = tile.pos;
    for (const prev of tile.prev) {
        if (prev.col === pos.col && prev.row === pos.row + 1) {
            down = true;
        }
        if (prev.col === pos.col && prev.row === pos.row - 1) {
            up = true;
        }
        if (prev.row === pos.row && prev.col === pos.col + 1) {
            right = true;
        }
        if (prev.row === pos.row && prev.col === pos.col - 1) {
            left = true;
        }
    }

    for (const next of tile.next) {
        if (next.col === pos.col && next.row === pos.row + 1) {
            down = true;
        }
        if (next.col === pos.col && next.row === pos.row - 1) {
            up = true;
        }
        if (next.row === pos.row && next.col === pos.col + 1) {
            right = true;
        }
        if (next.row === pos.row && next.col === pos.col - 1) {
            left = true;
        }
    }
    if (up && down && left && right) {
        return 'all-direction';
    }
    if (up && down && left) {
        return 't-left';
    }
    if (up && down && right) {
        return 't-right';
    }
    if (up && down) {
        return 'vertical';
    }
    if (left && right) {
        return 'horizontal';
    }
    if (left && up) {
        return 'left-up';
    }
    if (left && down) {
        return 'left-down';
    }
    if (right && up) {
        return 'right-up';
    }
    if (right && down) {
        return 'right-down';
    }
    window.alert('cannot find sprite for file ' + JSON.stringify(tile));
    throw new Error('cannot find sprite for file ' + JSON.stringify(tile));
}
