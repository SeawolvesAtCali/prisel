import { exist, Tile } from '@prisel/monopoly-common';
import assert from 'assert';
import { MovingExtra } from '../stateMachine/extra';
import { State } from '../stateMachine/stateEnum';
import { Transition } from '../stateMachine/transition';
import { checkType, getRand } from '../utils';
import { ChanceHandler } from './ChanceHandler';

const MAX_PATH_LENGTH = 1000;

export const moveToTileHandler: ChanceHandler<'move_to_tile'> = async (game, input) => {
    const currentPlayer = game.getCurrentPlayer();
    const currentTile = currentPlayer.pathTile?.get();
    if (!exist(currentTile)) {
        return;
    }
    const targetTile = game.world.get<Tile>(input.inputArgs.tileId);

    assert(
        targetTile instanceof Tile,
        `MoveToTile cannot find tile of id ${input.inputArgs.tileId}`,
    );

    if (input.inputArgs.isTeleport) {
        return checkType<Transition<MovingExtra>>({
            state: State.MOVING,
            extra: {
                type: 'usingTeleport',

                target: targetTile,
            },
        });
    }

    const path = currentTile.genPathWith((current, length) => {
        if ((length > 0 && current.id === input.inputArgs.tileId) || length >= MAX_PATH_LENGTH) {
            return undefined;
        }
        return getRand(current.next)?.get();
    });

    if (path.length !== 0) {
        return checkType<Transition<MovingExtra>>({
            state: State.MOVING,
            extra: {
                type: 'usingTiles',
                tiles: path,
            },
        });
    }
};
