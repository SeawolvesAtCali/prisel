import {
    Action,
    Anim,
    animationMap,
    ChanceArgs,
    PathNode,
    PlayerReceiveChancePayload,
} from '@prisel/monopoly-common';
import { broadcast, PacketType } from '@prisel/server';
import { Moved } from '../stateMachine/Moved';
import { checkType } from '../utils';
import { ChanceHandler } from './ChanceHander';

export const moveStepsHandler: ChanceHandler<'move_steps'> = async (game, input) => {
    const inputArgs = input.inputArgs;
    const currentPlayer = game.getCurrentPlayer();
    const startLocation = currentPlayer.pathNode.position;
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
            path: path.map((pathNode) => pathNode.position),
        }).setLength(animationMap.move * path.length),
    ).promise;
    return Moved;
};
