import {
    Action,
    Anim,
    animationMap,
    ChanceArgs,
    PlayerReceiveChancePayload,
    Tiles,
} from '@prisel/monopoly-common';
import { broadcast, PacketType } from '@prisel/server';
import { Moved } from '../stateMachine/Moved';
import { checkType, getRand } from '../utils';
import { ChanceHandler } from './ChanceHander';

const MAX_PATH_LENGTH = 1000;
export const moveToTileHandler: ChanceHandler<'move_to_tile'> = async (game, input) => {
    const currentPlayer = game.getCurrentPlayer();
    const currentLocation = currentPlayer.pathTile.position;

    const path = Tiles.genPathWith(currentPlayer.pathTile, (current, length) => {
        if ((length > 0 && current.id === input.inputArgs.tileId) || length >= MAX_PATH_LENGTH) {
            return undefined;
        }
        return getRand(current.path.next)();
    });

    if (path.length === 0) {
        return;
    }

    // move to the specified tile
    const coordinates = currentPlayer.move(path);
    // construct PlayerReceiveChancePayload
    broadcast<PlayerReceiveChancePayload>(game.room.getPlayers(), {
        type: PacketType.DEFAULT,
        action: Action.ANNOUNCE_CHANCE,
        payload: {
            id: currentPlayer.id,
            chance: {
                display: input.display,
                type: 'move_to_tile',
                args: checkType<ChanceArgs['move_to_tile']>({
                    tile: { position: path[path.length - 1].position },
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
            start: currentLocation,
            path: coordinates,
        }).setLength(animationMap.move * coordinates.length),
    ).promise;

    return Moved;
};
