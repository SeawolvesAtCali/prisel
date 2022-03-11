import { Action, Anim, animationMap } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import {
    actionRequestEvent,
    broadcast,
    Packet,
    Player,
    Request,
    Response,
    TurnOrder,
    useEventHandler,
} from '@prisel/server';
import {
    endState,
    newState,
    run,
    StateFuncReturn,
    useLocalState,
    useSideEffect,
} from '@prisel/state';
import { FIXED_STEPS, USE_FIXED_STEPS } from '../defaultFlags';
import { flags } from '../flags';
import { GameOverState } from './GameOver';
import { MovingState } from './Moving';
import { getGamePlayer, PlayingAnimation, usePlayerLeaveEvent } from './utils';

/**
 * This state is the start of a turn. On client side, camera is focused on the
 * current player and waiting for the player to roll.
 * This state ends when the current player rolls and moves to the destination.
 *
 * On entering this state, server will first broadcast
 * {@link Action.ANNOUNCE_START_TURN} to clients.
 * Then server will broadcast `turn_start` animation to clients. Client should
 * play some animation to denote which is the current player (current player
 * bouncing for example).
 * When the current client sends {@link Action.ROLL} request to server, server
 * will respond immediately to the current client with the dice number and the
 * path client will take. This response is merely used as an acknowledgement of
 * dice roll.
 * Server will also broadcast {@link Action.ANNOUNCE_ROLL} to all clients.
 * Clients should record the dice number and path in the state and use them when
 * animation.
 * Server then broadcasts a series of animation to all clients:
 *
 * dice_roll, dice_down, move
 *
 * When those animation should finish in client side, we transition to Moved state.
 *
 * animation: turn_start, dice_roll, dice_down, move
 */
export function PreRollState(props: { turnOrder: TurnOrder }): StateFuncReturn {
    const { turnOrder } = props;
    const [announceStartSent, setAnnounceStartSent] = useLocalState(false);
    const [rolled, setRolled] = useLocalState(false);
    useSideEffect(() => {
        broadcast(
            turnOrder.getAllPlayers(),
            Packet.forAction(Action.ANNOUNCE_START_TURN)
                .setPayload(monopolypb.AnnounceStartTurnPayload, {
                    player: getGamePlayer(turnOrder.getCurrentPlayer())?.id,
                })
                .build(),
        );
        const inspector = run(
            newState(PlayingAnimation, {
                animation: Anim.create('turn_start', monopolypb.TurnStartExtra)
                    .setExtra({
                        player: getGamePlayer(turnOrder.getCurrentPlayer())?.getGamePlayerInfo(),
                    })
                    .setLength(animationMap.turn_start)
                    .build(),
                turnOrder,
            }),
        );
        setAnnounceStartSent(true);
        return inspector.exit;
    }, []);

    const [steps, setSteps] = useLocalState(0);
    const [done, setDone] = useLocalState(false);

    useEventHandler(
        actionRequestEvent(Action.ROLL).filter(
            ({ player }) => turnOrder.getCurrentPlayer()?.equals(player) ?? false,
        ),
        ({ player, packet }) => {
            if (announceStartSent && !rolled) {
                setRolled(true);
                run(RollReceived, { rollRequest: packet, setSteps, turnOrder, player }).onComplete(
                    () => setDone(true),
                );
            }
        },
    );

    const leftPlayer = usePlayerLeaveEvent(turnOrder);
    if (leftPlayer) {
        return newState(GameOverState, { turnOrder });
    }

    if (done) {
        return newState(MovingState, {
            type: 'usingSteps',
            steps,
            turnOrder,
        });
    }
}

function* RollReceived(props: {
    player: Player;
    rollRequest: Request;
    setSteps: (roll: number) => void;
    turnOrder: TurnOrder;
}) {
    const { rollRequest, setSteps, turnOrder, player } = props;
    const currentPlayer = getGamePlayer(player)!;

    const steps = flags.get()?.[USE_FIXED_STEPS]
        ? flags.get()?.[FIXED_STEPS] || 1
        : currentPlayer.getDiceRoll();
    setSteps(steps);
    player.respond(
        Response.forRequest(rollRequest)
            .setPayload(monopolypb.RollResponse, {
                steps,
            })
            .build(),
    );

    broadcast(turnOrder.getAllPlayers(), (player) => {
        return Packet.forAction(Action.ANNOUNCE_ROLL)
            .setPayload(monopolypb.AnnounceRollPayload, {
                player: currentPlayer.id,
                steps,
                currentPosition: currentPlayer.pathTile?.get().position,
                myMoney: getGamePlayer(player)?.money ?? -1,
            })
            .build();
    });

    yield newState(PlayingAnimation, {
        animation: Anim.sequence(
            // turn_start animation should be terminated when dice_roll
            // is received.
            Anim.create('dice_roll', monopolypb.DiceRollExtra)
                .setExtra({
                    player: currentPlayer.getGamePlayerInfo(),
                })
                .setLength(animationMap.dice_roll),
            Anim.create('dice_down', monopolypb.DiceDownExtra)
                .setExtra({
                    steps,
                    player: currentPlayer.getGamePlayerInfo(),
                })
                .setLength(animationMap.dice_down),
        ),
        turnOrder,
    });

    return endState();
}
