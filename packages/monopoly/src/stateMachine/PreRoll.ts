import { Action, Anim, animationMap } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Packet, Request, Response } from '@prisel/server';
import {
    endState,
    getAmbient,
    newState,
    run,
    StateFuncReturn,
    useEvent,
    useLocalState,
    useSideEffect,
} from '@prisel/state';
import { FIXED_STEPS, USE_FIXED_STEPS } from '../defaultFlags';
import { flags } from '../flags';
import { getPlayer } from '../utils';
import { GameOverState } from './GameOver';
import { MovingState } from './Moving';
import {
    AnimatingAllPlayers,
    getCurrentPlayer,
    getGame,
    receivedPacketEventAmbient,
    usePlayerLeaveEvent,
} from './utils';

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
export function PreRollState(): StateFuncReturn {
    const game = getGame();
    const [announceStartSent, setAnnounceStartSent] = useLocalState(false);
    useSideEffect(() => {
        game.broadcast(
            Packet.forAction(Action.ANNOUNCE_START_TURN)
                .setPayload(monopolypb.AnnounceStartTurnPayload, {
                    player: game.getCurrentPlayer().id,
                })
                .build(),
        );
        run(
            newState(
                AnimatingAllPlayers,
                Anim.create('turn_start', monopolypb.TurnStartExtra)
                    .setExtra({
                        player: game.getCurrentPlayer().getGamePlayerInfo(),
                    })
                    .setLength(animationMap.turn_start)
                    .build(),
            ),
        );
        setAnnounceStartSent(true);
    }, []);

    const packetEventData = useEvent(
        getAmbient(receivedPacketEventAmbient)
            .filter(
                ({ packet, player }) =>
                    Packet.getAction(packet) === Action.ROLL &&
                    Request.isRequest(packet) &&
                    game.isCurrentPlayer(player),
            )
            .map(({ packet }) => packet as Request),
    );

    const [rolled, setRolled] = useLocalState(false);
    const [steps, setSteps] = useLocalState(0);
    const [done, setDone] = useLocalState(false);
    useSideEffect(() => {
        if (announceStartSent && !rolled && packetEventData) {
            setRolled(true);
            const inspector = run(RollReceived, { rollRequest: packetEventData.value, setSteps });
            inspector.onComplete(() => setDone(true));
            return inspector.exit;
        }
    }, [packetEventData, rolled, announceStartSent]);

    const leftPlayer = usePlayerLeaveEvent();
    if (leftPlayer) {
        return newState(GameOverState);
    }

    if (done) {
        return newState(MovingState, {
            type: 'usingSteps',
            steps,
        });
    }
}

function* RollReceived(props: { rollRequest: Request; setSteps: (roll: number) => void }) {
    const game = getGame();
    const currentPlayer = getCurrentPlayer();
    const { rollRequest, setSteps } = props;

    const steps = flags.get(USE_FIXED_STEPS) ? flags.get(FIXED_STEPS) : currentPlayer.getDiceRoll();
    setSteps(steps);
    getPlayer(currentPlayer).respond(
        Response.forRequest(rollRequest)
            .setPayload(monopolypb.RollResponse, {
                steps,
            })
            .build(),
    );

    game.broadcast((player) => {
        return Packet.forAction(Action.ANNOUNCE_ROLL)
            .setPayload(monopolypb.AnnounceRollPayload, {
                player: currentPlayer.id,
                steps,
                currentPosition: currentPlayer.pathTile?.get().position,
                myMoney: player.money,
            })
            .build();
    });

    yield newState(
        AnimatingAllPlayers,
        Anim.sequence(
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
    );

    return endState();
}
