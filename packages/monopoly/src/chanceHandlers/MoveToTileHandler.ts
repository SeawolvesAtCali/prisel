import { Action, Anim, animationMap, exist, Tile } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { assertExist, Packet } from '@prisel/server';
import assert from 'assert';
import { Moved } from '../stateMachine/Moved';
import { getPanAnimationLength } from '../stateMachine/utils';
import { getRand } from '../utils';
import { ChanceHandler } from './ChanceHander';

const MAX_PATH_LENGTH = 1000;

export const moveToTileHandler: ChanceHandler<'move_to_tile'> = async (game, input) => {
    const currentPlayer = game.getCurrentPlayer();
    const currentTile = currentPlayer.pathTile?.get();
    if (!exist(currentTile)) {
        return;
    }
    const currentLocation = currentTile.position;
    const targetTile = game.world.get<Tile>(input.inputArgs.tileId);

    assert(
        targetTile instanceof Tile,
        `MoveToTile cannot find tile of id ${input.inputArgs.tileId}`,
    );

    game.broadcast(
        Packet.forAction(Action.ANNOUNCE_CHANCE)
            .setPayload(monopolypb.AnnounceRecievedChancePayload, {
                player: currentPlayer.id,
                chance: {
                    display: input.display,
                    extra: {
                        oneofKind: 'moveToTile',
                        moveToTile: {
                            tile: assertExist(targetTile?.position),
                            isTeleport: input.inputArgs.isTeleport,
                        },
                    },
                },
            })
            .build(),
    );

    if (input.inputArgs.isTeleport) {
        currentPlayer.teleport(targetTile);

        const currentPlayerInfo = currentPlayer.getGamePlayerInfo();
        await Anim.processAndWait(
            (packet) => {
                game.broadcast(packet);
            },
            Anim.sequence(
                Anim.create('teleport_pickup', monopolypb.TeleportPickupExtra)
                    .setExtra({
                        vehicle: monopolypb.TeleportVehicle.UNSPECIFIED,
                        pickupLocation: currentLocation,
                        player: currentPlayerInfo,
                    })
                    .setLength(animationMap.teleport_pickup)
                    .build(),
                Anim.create('pan', monopolypb.PanExtra)
                    .setExtra({
                        target: targetTile.position,
                    })
                    .setLength(getPanAnimationLength(currentLocation, targetTile.position))
                    .build(),
                Anim.create('teleport_dropoff', monopolypb.TeleportDropoffExtra)
                    .setExtra({
                        vehicle: monopolypb.TeleportVehicle.UNSPECIFIED,
                        dropoffLocation: targetTile.position,
                        player: currentPlayerInfo,
                    })
                    .setLength(animationMap.teleport_dropoff)
                    .build(),
            ),
        ).promise;
        return Moved;
    }

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
            .setPayload(monopolypb.AnnounceRecievedChancePayload, {
                player: currentPlayer.id,
                chance: {
                    display: input.display,
                    extra: {
                        oneofKind: 'moveToTile',
                        moveToTile: {
                            tile: targetTile?.position,
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
        Anim.create('move', monopolypb.MoveExtra)
            .setExtra({
                player: currentPlayer.getGamePlayerInfo(),
                start: currentLocation,
                path: coordinates,
            })
            .setLength(animationMap.move * coordinates.length),
    ).promise;

    return Moved;
};
