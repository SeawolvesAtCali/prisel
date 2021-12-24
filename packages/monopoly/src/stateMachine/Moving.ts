import { Anim, animationMap, exist } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { endState, newState, run, useLocalState, useSideEffect } from '@prisel/state';
import { MovingExtra } from './extra';
import { GameOverState } from './GameOver';
import { MovedState } from './Moved';
import {
    AnimatingAllPlayers,
    getCurrentPlayer,
    getPanAnimationLength,
    usePlayerLeaveEvent,
} from './utils';

export function MovingState(props: MovingExtra) {
    const [done, setDone] = useLocalState(false);
    const currentPlayer = getCurrentPlayer();
    useSideEffect(() => {
        const inspector = run(function* () {
            const moving = props;
            const initialPos = currentPlayer.pathTile?.get().position;

            if (exist(initialPos) && moving.type === 'usingTeleport') {
                yield newState(Teleporting, moving);
            } else {
                yield newState(Walking, moving);
            }

            return endState({ onEnd: () => setDone(true) });
        }, props);
        return inspector.exit;
    }, []);
    const leftPlayer = usePlayerLeaveEvent();
    if (leftPlayer) {
        return newState(GameOverState);
    }
    if (done) {
        return newState(MovedState);
    }
}

function* Walking(props: MovingExtra) {
    const moving = props;
    const currentPlayer = getCurrentPlayer();
    const initialPos = currentPlayer.pathTile?.get().position;
    const path = (() => {
        if (moving?.type === 'usingSteps') {
            return currentPlayer.rollAndMove(moving.steps);
        }
        if (moving?.type === 'usingTiles') {
            return currentPlayer.move(moving.tiles);
        }
        return currentPlayer.rollAndMove();
    })();
    yield newState(
        AnimatingAllPlayers,
        Anim.create('move', monopolypb.MoveExtra)
            .setExtra({
                player: currentPlayer.getGamePlayerInfo(),
                start: initialPos,
                path,
            })
            .setLength(animationMap.move * path.length)
            .build(),
    );

    return endState();
}

function* Teleporting(props: MovingExtra & { type: 'usingTeleport' }) {
    const moving = props;
    const currentPlayer = getCurrentPlayer();
    const initialPos = currentPlayer.pathTile?.get().position;
    currentPlayer.teleport(moving.target);

    if (initialPos) {
        yield newState(
            AnimatingAllPlayers,
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
                        target: moving.target.position,
                    })
                    .setLength(getPanAnimationLength(initialPos!, moving.target.position))
                    .build(),
                Anim.create('teleport_dropoff', monopolypb.TeleportDropoffExtra)
                    .setExtra({
                        vehicle: monopolypb.TeleportVehicle.UNSPECIFIED,
                        dropoffLocation: moving.target.position,
                        player: currentPlayer.getGamePlayerInfo(),
                    })
                    .setLength(animationMap.teleport_dropoff)
                    .build(),
            ),
        );
    }

    return endState();
}
