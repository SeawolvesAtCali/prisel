import { Action, Anim, animationMap } from '@prisel/monopoly-common';
import { animation_spec, announce_received_chance_spec } from '@prisel/protos';
import { Packet } from '@prisel/server';
import { Moved } from '../stateMachine/Moved';
import { getRand } from '../utils';
import { ChanceHandler } from './ChanceHander';

const MAX_PATH_LENGTH = 1000;
export const moveToTileHandler: ChanceHandler<'move_to_tile'> = async (game, input) => {
    const currentPlayer = game.getCurrentPlayer();
    const currentTile = currentPlayer.pathTile.get();
    const currentLocation = currentTile.position;

    const path = currentTile.genPathWith((current, length) => {
        if ((length > 0 && current.id === input.inputArgs.tileId) || length >= MAX_PATH_LENGTH) {
            return undefined;
        }
        return getRand(current.next)?.get();
    });

    if (path.length === 0) {
        return;
    }

    // move to the specified tile
    const coordinates = currentPlayer.move(path);
    // construct PlayerReceiveChancePayload

    game.broadcast(
        Packet.forAction(Action.ANNOUNCE_CHANCE)
            .setPayload(announce_received_chance_spec.AnnounceRecievedChancePayload, {
                player: currentPlayer.id,
                chance: {
                    display: input.display,
                    extra: {
                        oneofKind: 'moveToTile',
                        moveToTile: {
                            tile: path[path.length - 1].position,
                            isTeleport: input.inputArgs.isTeleport,
                        },
                    },
                },
            })
            .build(),
    );

    await Anim.processAndWait(
        (packet) => {
            game.broadcast(packet);
        },
        Anim.create('move', animation_spec.MoveExtra)
            .setExtra({
                player: currentPlayer.getGamePlayerInfo(),
                start: currentLocation,
                path: coordinates,
            })
            .setLength(animationMap.move * coordinates.length),
    ).promise;

    return Moved;
};
