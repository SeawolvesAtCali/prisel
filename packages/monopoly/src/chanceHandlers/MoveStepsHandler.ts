import { exist, Tile } from '@prisel/monopoly-common';
import { endState, newState } from '@prisel/state';
import { MovingState } from '../stateMachine/Moving';
import { getCurrentPlayer } from '../stateMachine/utils';
import { ChanceHandler } from './ChanceHandler';

export const moveStepsHandler: ChanceHandler<'move_steps'> = (props) => {
    const { input, setNextState } = props;
    const currentPlayer = getCurrentPlayer();
    const inputArgs = input.inputArgs;
    const currentTile = currentPlayer.pathTile?.get();
    if (!exist(currentTile)) {
        return endState();
    }
    let path: Tile[] = [];
    if (inputArgs.steps > 0) {
        path = currentTile.genPath(inputArgs.steps);
    }
    if (inputArgs.steps < 0) {
        path = currentTile.genPathReverse(-inputArgs.steps);
    }
    setNextState(newState(MovingState, { type: 'usingTiles', tiles: path }));

    return endState();
};
