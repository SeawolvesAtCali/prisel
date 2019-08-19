import { ClientId, Handle } from '@prisel/server';
import Game from './Game';
import { create as createPlayer } from './Player';
import { create as createGame } from './Game';
import createBoard, { genId } from './gameData/board';

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
    // tslint:disable-next-line:no-console
    console.log(game.flat());
    return game;
}

export function flattenState(gameState: Game): object {
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
