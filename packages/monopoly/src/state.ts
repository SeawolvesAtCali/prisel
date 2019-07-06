import { ClientId } from '@prisel/server';

export interface Node {
    id: string;
    next?: Node;
    prev?: Node;
}

export interface Property {
    id: string;
    price: number;
    rent: number;
    name: string;
}

export enum PlayerPhase {
    WAITING, // Not player's turn yet or Player hasn't roll dice yet.
    ROLLED, // Player rolled a dice, maybe waiting for other action
}

export interface Player {
    id: ClientId;
    position?: Node;
    owning: Property[];
    cash: number;
    phase: PlayerPhase;
}

export interface GameState {
    players: Map<ClientId, Player>;
    turnOrder: Player[];
    map: Node;
}

function createPlayer(playerId: ClientId, initialNode: Node, initialCash: number): Player {
    return {
        id: playerId,
        position: initialNode,
        owning: [],
        cash: initialCash,
        phase: PlayerPhase.WAITING,
    };
}

function createNode(): Node {
    return {
        id: '1',
    };
}

const CASH = 1000;

export function createIntialState(players: ClientId[]): GameState {
    const firstNode = createNode();
    const playerMap = new Map(
        players.map((player) => [player, createPlayer(player, firstNode, CASH)]),
    );
    return {
        players: playerMap,
        turnOrder: players.map((player) => playerMap.get(player)),
        map: firstNode,
    };
}

export function flattenState(gameState: GameState): object {
    const players: any = {};
    for (const [playerId, player] of gameState.players) {
        players[playerId] = {
            id: playerId,
            cash: player.cash,
        };
    }
    return {
        currentPlayer: gameState.turnOrder[0].id,
        players,
    };
}
