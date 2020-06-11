import { Room } from '@prisel/server';
import fs from 'fs';
import Game from './Game';
import { create as createGamePlayer } from './GamePlayer';
import { create as createGame } from './Game';
import genId from './genId';
import {
    BoardSetup,
    isStartTile,
    isWalkable,
    Tile,
    Coordinate,
    isPropertyTile,
} from '@prisel/monopoly-common';
import PathNode, { create as createPathNode } from './PathNode';
import Property, { create as createProperty } from './Property';
import { getRand } from './utils';
import { COMMON_DATA_DIR } from '../PATH';
import path from 'path';

const CASH = 1000;
const MAP_PATH = path.resolve(COMMON_DATA_DIR, 'map', 'demoMap.json');

export function getTileKey(tile: Tile): string {
    return getTileKeyFromCoordinate(tile.pos);
}

export function getTileKeyFromCoordinate(coor: Coordinate): string {
    return `${coor.row}-${coor.col}`;
}

// process all the tiles and reference each tile and property. Return the
// starting pathNodes. All other PathNode and Property objects wouldn't be
// garbage collected since they all have some refence with starting PathNodes.
function processBoardSetup(boardSetup: BoardSetup): [PathNode[], Property[]] {
    const startPathNodes: PathNode[] = [];
    const pathNodeMap: Map<string, PathNode> = new Map();
    const propertyMap: Map<string, Property> = new Map();
    for (const tile of boardSetup.tiles) {
        if (isWalkable(tile)) {
            const pathNode = createPathNode({ id: genId(), tile });
            pathNodeMap.set(getTileKey(tile), pathNode);
            if (isStartTile(tile)) {
                startPathNodes.push(pathNode);
            }
        } else if (isPropertyTile(tile)) {
            const property = createProperty({
                id: genId(),
                cost: tile.price,
                rent: tile.rent,
                name: tile.name,
                pos: tile.pos,
            });
            propertyMap.set(getTileKey(tile), property);
        }
    }
    // connect all pathNodes
    for (const tile of boardSetup.tiles) {
        if (isWalkable(tile)) {
            const currentPathNode = pathNodeMap.get(getTileKey(tile));
            for (const nextTilePos of tile.next) {
                const nextPathNode = pathNodeMap.get(getTileKeyFromCoordinate(nextTilePos));
                currentPathNode.addNext(nextPathNode);
                nextPathNode.addPrev(currentPathNode);
            }
        }
    }

    // connect all properties with pathNodes
    for (const roadPropertyMapping of boardSetup.roadPropertyMapping) {
        const pathNode = pathNodeMap.get(getTileKeyFromCoordinate(roadPropertyMapping[0]));
        const property = propertyMap.get(getTileKeyFromCoordinate(roadPropertyMapping[1]));
        pathNode.addProperty(property);
    }

    return [startPathNodes, Array.from(propertyMap.values())];
}
export async function createIntialState(room: Room): Promise<Game> {
    const rawBoardSetup = await fs.promises.readFile(MAP_PATH);
    if (!rawBoardSetup) {
        throw new Error('Cannot load map');
    }
    const boardSetup: BoardSetup = JSON.parse(rawBoardSetup.toString());
    const [startPathNodes, properties] = processBoardSetup(boardSetup);
    const players = room.getPlayers();
    const playerMap = new Map(
        players.map((player, index) => [
            player.getId(),
            createGamePlayer({
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
        properties,
    });
    return game;
}

export function flattenState(game: Game) {
    return {
        currentPlayer: game.turnOrder[0].id,
        players: Array.from(game.players.values()).map((player) => player.flat()),
    };
}
