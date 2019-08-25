import { ClientId, Handle } from '@prisel/server';
import Game from './Game';
import { create as createPlayer } from './Player';
import { create as createGame } from './Game';
import createBoard from './gameData/board';
import Node from './Node';
import genId from './genId';

const CASH = 1000;

export function createIntialState(players: ClientId[], handle: Handle): Game {
    const board = createBoard(handle);
    const playerMap = new Map(
        players.map((player) => [
            player,
            createPlayer(
                {
                    cash: CASH,
                    id: player,
                    owning: [],
                    rolled: false,
                    position: board,
                },
                handle,
            ),
        ]),
    );

    const game = createGame(
        {
            id: genId(),
            players: playerMap,
            turnOrder: Array.from(playerMap.values()),
            map: board,
        },
        handle,
    );
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

export function flattenState(game: Game): object {
    return {
        currentPlayer: game.turnOrder[0].id,
        players: Array.from(game.players.values()).map((player) => player.flat()),
        map: flattenMap(game.map).map((node) => ({
            node: node.flat(),
            property: node.property ? node.property.flat() : null,
        })),
    };
}
