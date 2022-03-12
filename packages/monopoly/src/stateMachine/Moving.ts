import { Anim, animationMap, exist } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { TurnOrder } from '@prisel/server';
import { endState, newState, run, useLocalState, useSideEffect } from '@prisel/state';
import { MovingExtra } from './extra';
import { GameOverState } from './GameOver';
import { MovedState } from './Moved';
import {
    getGamePlayer,
    getPanAnimationLength,
    PlayingAnimation,
    usePlayerLeaveEvent,
} from './utils';

export function MovingState(props: MovingExtra & { turnOrder: TurnOrder }) {
    const { turnOrder } = props;
    const [done, setDone] = useLocalState(false);
    const currentPlayer = getGamePlayer(turnOrder.getCurrentPlayer());
    const leftPlayer = usePlayerLeaveEvent(turnOrder);
    useSideEffect(() => {
        const moving = props;
        const initialPos = currentPlayer?.pathTile?.get().position;
        if (exist(initialPos) && moving.type === 'usingTeleport') {
            run(newState(Teleporting, moving)).onComplete(() => setDone(true));
        } else {
            run(newState(Walking, moving)).onComplete(() => setDone(true));
        }
    }, []);
    if (leftPlayer) {
        return newState(GameOverState, { turnOrder });
    }
    if (done) {
        return newState(MovedState, { turnOrder });
    }
}

function* Walking(props: MovingExtra & { turnOrder: TurnOrder }) {
    const moving = props;
    const { turnOrder } = props;
    const currentPlayer = getGamePlayer(turnOrder.getCurrentPlayer());
    const initialPos = currentPlayer?.pathTile?.get().position;
    const path = (() => {
        switch (moving.type) {
            case 'usingSteps':
                return currentPlayer?.rollAndMove(moving.steps);
            case 'usingTiles':
                return currentPlayer?.move(moving.tiles);
        }
        return currentPlayer?.rollAndMove();
    })();
    if (path) {
        yield newState(PlayingAnimation, {
            animation: Anim.create('move', monopolypb.MoveExtra)
                .setExtra({
                    player: currentPlayer?.getGamePlayerInfo(),
                    start: initialPos,
                    path,
                })
                .setLength(animationMap.move * path.length)
                .build(),
            turnOrder,
        });
    }

    return endState();
}

function* Teleporting(props: MovingExtra & { type: 'usingTeleport'; turnOrder: TurnOrder }) {
    const moving = props;
    const { turnOrder } = props;
    const currentPlayer = getGamePlayer(turnOrder.getCurrentPlayer());
    const initialPos = currentPlayer?.pathTile?.get().position;
    currentPlayer?.teleport(moving.target);

    if (initialPos) {
        yield newState(PlayingAnimation, {
            animation: Anim.sequence(
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
            turnOrder,
        });
    }

    return endState();
}
