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

export interface Tile {
    type: TileType;
    pos: Coordinate;
}

export interface RoadTile extends Tile {
    type: TileType.ROAD;
    next: Coordinate;
    prev: Coordinate;
}

export interface StartTile extends Tile {
    type: TileType.START;
    next: Coordinate;
    prev: Coordinate;
}

export interface PropertyTile extends Tile {
    type: TileType.PROPERTY;
    name: string;
    price: number;
    rent: number;
}

// A pair of road and property positions. Meaning those two are connected. When
// player land on the road tile, they can purchase property or need to pay rent.
export interface CoordinatePair {
    0: Coordinate;
    1: Coordinate;
}

export interface BoardSetup {
    height: number;
    width: number;
    tiles: Tile[];
    roadPropertyMapping: CoordinatePair[];
}
