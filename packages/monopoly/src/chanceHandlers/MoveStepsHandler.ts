import { exist, Tile } from '@prisel/monopoly-common';
import { MovingExtra } from '../stateMachine/extra';
import { State } from '../stateMachine/stateEnum';
import { Transition } from '../stateMachine/transition';
import { checkType } from '../utils';
import { ChanceHandler } from './ChanceHandler';

export const moveStepsHandler: ChanceHandler<'move_steps'> = async (game, input) => {
    const inputArgs = input.inputArgs;
    const currentPlayer = game.getCurrentPlayer();
    const currentTile = currentPlayer.pathTile?.get();
    if (!exist(currentTile)) {
        return;
    }
    let path: Tile[] = [];
    if (inputArgs.steps > 0) {
        path = currentTile.genPath(inputArgs.steps);
        // currentPlayer.move(path);
    }
    if (inputArgs.steps < 0) {
        path = currentTile.genPathReverse(-inputArgs.steps);
        // currentPlayer.move(path);
    }

    return checkType<Transition<MovingExtra>>({
        state: State.MOVING,
        extra: {
            type: 'usingTiles',
            tiles: path,
        },
    });
};
