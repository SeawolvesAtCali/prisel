import {
    BoardSetup,
    Coordinate,
    genId,
    Mixins,
    PropertyClass,
    TileClass,
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
        .registerObject(TileClass)
        .registerObject(GamePlayer)
        .registerObject(PropertyClass)
        .deserialize(boardSetup.world);
    const startPathTiles = world
        .getAll(TileClass)
        .filter((tile) => Mixins.hasMixin(tile, Mixins.StartMixinConfig));
    const players = room.getPlayers();
    const playerMap = new Map(
        players.map((player, index) => [
            player.getId(),
            world.create(GamePlayer, player.getId()).init({
                cash: CASH,
                id: player.getId(),
                player,
                owning: [],
                rolled: false,
                pathTile: getRand(startPathTiles),
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
