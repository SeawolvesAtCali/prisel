import { Anim, animationMap, exist } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { MovingExtra } from './extra';
import { State } from './stateEnum';
import { StateMachineState } from './StateMachineState';
import { Transition } from './transition';
import { getPanAnimationLength } from './utils';

export class Moving extends StateMachineState<MovingExtra> {
    public async onEnter(transition: Transition<MovingExtra>) {
        const currentPlayer = this.game.getCurrentPlayer();
        const initialPos = currentPlayer.pathTile?.get().position;

        if (exist(initialPos) && transition.extra?.type === 'usingTeleport') {
            currentPlayer.teleport(transition.extra.target);
            await Anim.wait(
                Anim.sequence(
                    Anim.create('teleport_pickup', monopolypb.TeleportPickupExtra)
                        .setExtra({
                            vehicle: monopolypb.TeleportVehicle.UNSPECIFIED,
                            pickupLocation: initialPos,
                            player: currentPlayer.getGamePlayerInfo(),
                        })
                        .setLength(animationMap.teleport_pickup)
                        .build(),
                    Anim.create('pan', monopolypb.PanExtra)
                        .setExtra({
                            target: transition.extra.target.position,
                        })
                        .setLength(
                            getPanAnimationLength(initialPos, transition.extra.target.position),
                        )
                        .build(),
                    Anim.create('teleport_dropoff', monopolypb.TeleportDropoffExtra)
                        .setExtra({
                            vehicle: monopolypb.TeleportVehicle.UNSPECIFIED,
                            dropoffLocation: transition.extra.target.position,
                            player: currentPlayer.getGamePlayerInfo(),
                        })
                        .setLength(animationMap.teleport_dropoff)
                        .build(),
                ),
                {
                    onStart: this.broadcastAnimation,
                },
            );
            this.transition({ state: State.MOVED });
            return;
        }

        const pathCoordinates = (() => {
            if (transition.extra?.type === 'usingSteps') {
                return currentPlayer.rollAndMove(transition.extra.steps);
            }
            if (transition.extra?.type === 'usingTiles') {
                return currentPlayer.move(transition.extra.tiles);
            }
            return currentPlayer.rollAndMove();
        })();

        await Anim.wait(
            Anim.create('move', monopolypb.MoveExtra)
                .setExtra({
                    player: currentPlayer.getGamePlayerInfo(),
                    start: initialPos,
                    path: pathCoordinates,
                })
                .setLength(animationMap.move * pathCoordinates.length)
                .build(),
            { onStart: this.broadcastAnimation },
        );

        this.transition({ state: State.MOVED });
        return;
    }

    public readonly [Symbol.toStringTag] = 'Moving';
}
