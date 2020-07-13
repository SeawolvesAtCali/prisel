import {
    BoardSetup,
    Coordinate,
    genId,
    hasMixin,
    PathNode,
    Property,
    StartMixinConfig,
    Tile,
    World,
} from '@prisel/monopoly-common';
import { Room } from '@prisel/server';
import fs from 'fs';
import path from 'path';
import { COMMON_DATA_DIR } from '../PATH';
import Game, { create as createGame } from './Game';
import { GamePlayer } from './gameObjects/GamePlayer';
import { getRand } from './utils';

const CASH = 500;
const MAP_PATH = path.resolve(COMMON_DATA_DIR, 'map', 'demoMap.json');

export function getTileKey(tile: Tile): string {
    return getTileKeyFromCoordinate(tile.pos);
}

export function getTileKeyFromCoordinate(coor: Coordinate): string {
    return `${coor.row}-${coor.col}`;
}

export async function createIntialState(room: Room): Promise<Game> {
    const rawBoardSetup = await fs.promises.readFile(MAP_PATH);
    if (!rawBoardSetup) {
        throw new Error('Cannot load map');
    }
    const boardSetup: BoardSetup = JSON.parse(rawBoardSetup.toString());
    const world = new World()
        .registerObject(PathNode)
        .registerObject(GamePlayer)
        .registerObject(Property)
        .deserialize(boardSetup.world);
    const startPathNodes = world
        .getAll(PathNode)
        .filter((tile) => hasMixin(tile, StartMixinConfig));
    const players = room.getPlayers();
    const playerMap = new Map(
        players.map((player, index) => [
            player.getId(),
            world.create(GamePlayer).init({
                cash: CASH,
                id: player.getId(),
                player,
                owning: [],
                rolled: false,
                pathNode: getRand(startPathNodes),
                character: index,
            }),
        ]),
    );

    const game = createGame({
        id: genId(),
        players: playerMap,
        turnOrder: Array.from(playerMap.values()),
        room,
        world,
    });
    return game;
}
