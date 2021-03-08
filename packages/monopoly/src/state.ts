import { BoardSetup, GamePlayer, genId, MonopolyWorld, Tile } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Player, Room } from '@prisel/server';
import fs from 'fs';
import path from 'path';
import { COMMON_DATA_DIR } from '../PATH';
import Game, { create as createGame } from './Game';
import { getRand } from './utils';

const CASH = 500;
const MAP_PATH = path.resolve(COMMON_DATA_DIR, 'map', 'demoMap.json');

export function getTileKeyFromCoordinate(coor: monopolypb.Coordinate): string {
    return `${coor.row}-${coor.col}`;
}

export async function createIntialState(
    room: Room,
    addPlayerMapping: (player: Player, gamePlayer: GamePlayer) => void,
    getGamePlayerByPlayer: (player: Player) => GamePlayer | undefined,
): Promise<Game> {
    const rawBoardSetup = await fs.promises.readFile(MAP_PATH);
    if (!rawBoardSetup) {
        throw new Error('Cannot load map');
    }
    const boardSetup: BoardSetup = JSON.parse(rawBoardSetup.toString());
    const world = new MonopolyWorld().populate(boardSetup.world);
    const startPathTiles = world.getAll(Tile).filter((tile) => tile.isStart);
    const players = room.getPlayers();
    const playerMap = new Map<string, GamePlayer>();
    let characterCount = 0;
    for (const player of players) {
        const playerId = player.getId();
        const startTile = getRand(startPathTiles);
        if (!startTile) {
            throw new Error('no start tile');
        }
        const gamePlayer = world.create(GamePlayer, playerId).init({
            money: CASH,
            id: player.getId(),
            player,
            owning: [],
            rolled: false,
            pathTile: startTile,
            character: characterCount,
        });
        characterCount++;
        playerMap.set(playerId, gamePlayer);
        addPlayerMapping(player, gamePlayer);
    }

    const game = createGame({
        id: genId(),
        players: playerMap,
        turnOrder: Array.from(playerMap.values()),
        room,
        world,
        getGamePlayerByPlayer: getGamePlayerByPlayer,
    });
    return game;
}
