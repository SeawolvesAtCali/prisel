import { exist, Tile } from '@prisel/monopoly-common';
import { endState, newState } from '@prisel/state';
import assert from 'assert';
import { MovingState } from '../stateMachine/Moving';
import { getGame, getGamePlayer } from '../stateMachine/utils';
import { getRand } from '../utils';
import { ChanceHandler } from './ChanceHandler';

const MAX_PATH_LENGTH = 1000;

export const moveToTileHandler: ChanceHandler<'move_to_tile'> = (props) => {
    const { input, setNextState, turnOrder } = props;
    const currentPlayer = getGamePlayer(turnOrder.getCurrentPlayer());
    if (!currentPlayer) {
        return endState();
    }
    const game = getGame();
    const currentTile = currentPlayer.pathTile?.get();
    if (!exist(currentTile)) {
        return endState();
    }
    const targetTile = game.world.get<Tile>(input.inputArgs.tileId);

    assert(
        targetTile instanceof Tile,
        `MoveToTile cannot find tile of id ${input.inputArgs.tileId}`,
    );

    if (input.inputArgs.isTeleport) {
        setNextState(
            newState(MovingState, { type: 'usingTeleport', target: targetTile, turnOrder }),
        );
        return endState();
    }

    const path = currentTile.genPathWith((current, length) => {
        if ((length > 0 && current.id === input.inputArgs.tileId) || length >= MAX_PATH_LENGTH) {
            return undefined;
        }
        return getRand(current.next)?.get();
    });

    if (path.length !== 0) {
        setNextState(newState(MovingState, { type: 'usingTiles', tiles: path, turnOrder }));
        return endState();
    }
};
