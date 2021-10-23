import { exist, Tile } from '@prisel/monopoly-common';
import { endState, newState } from '@prisel/state';
import assert from 'assert';
import { MovingState } from '../stateMachine/Moving';
import { getCurrentPlayer, getGame } from '../stateMachine/utils';
import { getRand } from '../utils';
import { ChanceHandler } from './ChanceHandler';

const MAX_PATH_LENGTH = 1000;

export const moveToTileHandler: ChanceHandler<'move_to_tile'> = (props) => {
    const currentPlayer = getCurrentPlayer();
    const game = getGame();
    const currentTile = currentPlayer.pathTile?.get();
    const { input, setNextState } = props;
    if (!exist(currentTile)) {
        return endState();
    }
    const targetTile = game.world.get<Tile>(input.inputArgs.tileId);

    assert(
        targetTile instanceof Tile,
        `MoveToTile cannot find tile of id ${input.inputArgs.tileId}`,
    );

    if (input.inputArgs.isTeleport) {
        setNextState(newState(MovingState, { type: 'usingTeleport', target: targetTile }));
        return endState();
    }

    const path = currentTile.genPathWith((current, length) => {
        if ((length > 0 && current.id === input.inputArgs.tileId) || length >= MAX_PATH_LENGTH) {
            return undefined;
        }
        return getRand(current.next)?.get();
    });

    if (path.length !== 0) {
        setNextState(newState(MovingState, { type: 'usingTiles', tiles: path }));
        return endState();
    }
};
