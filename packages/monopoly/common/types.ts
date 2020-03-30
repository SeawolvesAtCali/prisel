export enum TileType {
    UNSPECIFIED = 0,
    ROAD = 1,
    PROPERTY = 2,
    START = 3,
}

export interface Coordinate {
    row: number;
    col: number;
}

export interface Walkable {
    next: Coordinate[];
    prev: Coordinate[];
}

export interface Tile {
    type: TileType;
    pos: Coordinate;
}

export interface RoadTile extends Tile, Walkable {
    type: TileType.ROAD;
}

export function isRoadTile(tile: Tile): tile is RoadTile {
    return tile && tile.type === TileType.ROAD;
}

export interface StartTile extends Tile, Walkable {
    type: TileType.START;
}

export function isStartTile(tile: Tile): tile is StartTile {
    return tile && tile.type === TileType.START;
}

export function isWalkable(tile: Tile): tile is Tile & Walkable {
    return isStartTile(tile) || isRoadTile(tile);
}

export interface PropertyTile extends Tile {
    type: TileType.PROPERTY;
    name: string;
    price: number;
    rent: number;
}

export function isPropertyTile(tile: Tile): tile is PropertyTile {
    return tile && tile.type === TileType.PROPERTY;
}

// A pair of road and property positions. Meaning those two are connected. When
// player land on the road tile, they can purchase property or need to pay rent.
export interface CoordinatePair {
    0: Coordinate; // road
    1: Coordinate; // property
}

export interface BoardSetup {
    height: number;
    width: number;
    tiles: Tile[];
    roadPropertyMapping: CoordinatePair[];
}
