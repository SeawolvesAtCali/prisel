import { BoardSetup, GamePlayer, genId, MonopolyWorld, Tile } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { debug, Player, TurnOrder } from '@prisel/server';
import { useLocalState, useSideEffect } from '@prisel/state';
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

export function useInitialState(
    turnOrder: TurnOrder,
    addPlayerMapping: (player: Player, gamePlayer: GamePlayer) => void,
) {
    const boardSetup = useBoardSetup();
    const [game, setGame] = useLocalState<Game>();
    useSideEffect(() => {
        if (boardSetup) {
            const world = new MonopolyWorld().populate(boardSetup.world);
            const startPathTiles = world.getAll(Tile).filter((tile) => tile.isStart);
            let characterCount = 0;
            for (const player of turnOrder.getAllPlayers()) {
                const playerId = player.getId();
                const startTile = getRand(startPathTiles);
                if (!startTile) {
                    debug('map has no start tile');
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
                addPlayerMapping(player, gamePlayer);
            }

            const game = createGame({
                id: genId(),
                turnOrder: turnOrder,
                world,
            });
            setGame(game);
        }
    }, [boardSetup, turnOrder]);

    return game;
}

function useBoardSetup() {
    const [boardSetup, setBoardSetup] = useLocalState<BoardSetup>();
    useSideEffect(() => {
        fs.readFile(MAP_PATH, (err, data) => {
            if (err) {
                debug(`Failed to read map file at ${MAP_PATH}`);
                throw err;
            }
            if (data) {
                const boardSetup: BoardSetup = JSON.parse(data.toString());
                setBoardSetup(boardSetup);
            }
        });
    }, []);
    return boardSetup;
}
