import { broadcast, PacketType } from '@prisel/server';
import { checkType } from '../utils';
import {
    ChanceArgs,
    Anim,
    animationMap,
    Action,
    PlayerReceiveChancePayload,
} from '@prisel/monopoly-common';
import PathNode from '../PathNode';
import { ChanceHandler } from './ChanceHander';
import { Moved } from '../stateMachine/Moved';

export const moveStepsHandler: ChanceHandler<'move_steps'> = async (game, input) => {
    const inputArgs = input.inputArgs;
    const currentPlayer = game.getCurrentPlayer();
    const startLocation = currentPlayer.pathNode.tile.pos;
    let path: PathNode[] = [];
    if (inputArgs.steps > 0) {
        path = currentPlayer.pathNode.genPath(inputArgs.steps);
        currentPlayer.move(path);
    }
    if (inputArgs.steps < 0) {
        path = currentPlayer.pathNode.genPathReverse(-inputArgs.steps);
        currentPlayer.move(path);
    }

    broadcast<PlayerReceiveChancePayload>(game.room.getPlayers(), {
        type: PacketType.DEFAULT,
        action: Action.ANNOUNCE_CHANCE,
        payload: {
            id: currentPlayer.id,
            chance: {
                display: input.display,
                type: 'move_steps',
                args: checkType<ChanceArgs['move_steps']>({
                    steps: inputArgs.steps,
                }),
            },
        },
    });
    await Anim.processAndWait(
        (packet) => {
            broadcast(game.room.getPlayers(), packet);
        },
        Anim.create('move', {
            player: currentPlayer.getGamePlayerInfo(),
            start: startLocation,
            path: path.map((pathNode) => pathNode.tile.pos),
        }).setLength(animationMap.move * path.length),
    ).promise;
    return Moved;
};
