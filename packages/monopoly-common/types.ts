import { PlayerInfo } from '@prisel/common';

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
    sprite?: string;
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

export interface PropertyLevel {
    // The cost to reach this level from previous level
    // If this is the first level, the cost is land purchase cost
    cost: number;
    rent: number;
}
export interface PropertyInfo {
    levels?: PropertyLevel[];
    currentLevel?: number;
    cost?: number; // the cost to upgrade to this level
    rent?: number; // the rent of this level
    name: string;
    pos: Coordinate;
    isUpgrade?: boolean;
}

/**
 * Information about a game character that player controls
 */
export interface GamePlayerInfo {
    money: number;
    player: PlayerInfo;
    pos: Coordinate;
    // character determine the sprite set, or color client side use to
    // denote the player
    character: number;
}

export interface PayRentEncounter {
    payments: Payment[];
}

export interface PropertyForPurchaseEncounter {
    properties: PropertyInfo[];
}
export interface Encounter {
    payRent?: PayRentEncounter;
}

export interface Payment {
    from: string;
    to: string;
    amount: number;
    forProperty?: PropertyInfo;
}

export interface Rank {
    player: PlayerInfo;
    character: number;
    assets: {
        cash: number;
        property: number;
        total: number;
    };
}

export enum AnimationType {
    DEFAULT,
    SEQUENCE, // container that plays child animations one by one
    RACE, // container that plays child animations and finish when one of them finishes. Other animations are truncated if possible
    ALL, // container that plays child animations and wait for the longest one to finish.
}
export interface Animation<ArgType = any> {
    name?: string; // name of the individual animation,
    type: AnimationType;
    args?: ArgType;
    length?: number; // duration, specified when type is DEFAULT
    children?: Animation[];
}
