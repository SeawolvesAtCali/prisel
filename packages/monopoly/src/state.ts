import { Player, Room } from '@prisel/server';
import Game from './Game';
import { create as createPlayer } from './GamePlayer';
import { create as createGame } from './Game';
import createBoard from './gameData/board';
import Node from './Node';
import genId from './genId';

const CASH = 1000;

export function createIntialState(room: Room): Game {
    const players = room.getPlayers();
    const board = createBoard();
    const playerMap = new Map(
        players.map((player) => [
            player.getId(),
            createPlayer({
                cash: CASH,
                id: player.getId(),
                player,
                owning: [],
                rolled: false,
                position: board,
            }),
        ]),
    );

    const game = createGame({
        id: genId(),
        players: playerMap,
        turnOrder: Array.from(playerMap.values()),
        map: board,
        room,
    });
    return game;
}

function flattenMap(node: Node): Node[] {
    const nodeSet = new Set<Node>();
    let currentNode = node;
    while (currentNode && !nodeSet.has(currentNode)) {
        nodeSet.add(currentNode);
        currentNode = currentNode.next;
    }
    return Array.from(nodeSet);
}

export function flattenState(game: Game) {
    return {
        currentPlayer: game.turnOrder[0].id,
        players: Array.from(game.players.values()).map((player) => player.flat()),
        map: flattenMap(game.map).map((node) => ({
            node: node.flat(),
            property: node.property ? node.property.flat() : null,
        })),
    };
}
