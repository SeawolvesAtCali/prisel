import { Action, Anim, animationMap } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import {
    actionPacketEvent,
    actionRequestEvent,
    Response,
    TurnOrder,
    useEventHandler,
} from '@prisel/server';
import { newState, run, useComputed, useLocalState, useStored } from '@prisel/state';
import { GameOverState } from './GameOver';
import { PreRollState } from './PreRoll';
import { getGamePlayer, PlayingAnimation, usePlayerLeaveEvent } from './utils';

/**
 * When game starts, each client should request GET_INITIAL_STATE. This is how
 * server knows that a client is on game scene and ready to receive game
 * packages.
 * Server send initial state to client upon GET_INITIAL_STATE. When client
 * finishes instantiating all the game objects (including loading maps), client
 * should send back READY_TO_START_GAME.
 * Server then sends animation to client, this includes showing "START!" as well
 * as panning to the first player, upon READ_TO_START_GAME.
 * When all clients send back READY_TO_START_GAME, and the animation for the
 * last player(the last one that send back READY_TO_START_GAME) *should* finish,
 * we go to the next state PreRoll.
 *
 * Usually we don't want to wait(sync) for all clients as we should allow client
 * to temporarily disconnect (for example, switching tab). But this is the start
 * of the game, so it would be good to catch any inactive player. Also we are
 * not able to respond to GET_INITIAL_STATE after this state.
 *
 * animations: game_start, pan
 */
export function GameStartedState(props: { turnOrder: TurnOrder }) {
    const { turnOrder } = props;
    const initialState = useComputed<monopolypb.GetInitialStateResponse>(
        () => ({
            players: turnOrder.getAllPlayers().map((player) => {
                const gamePlayer = getGamePlayer(player)!;
                return gamePlayer.getGamePlayerInfo();
            }),
            firstPlayerId: getGamePlayer(turnOrder.getCurrentPlayer())!.id,
        }),
        [],
    );
    useEventHandler(actionRequestEvent(Action.GET_INITIAL_STATE), ({ player, packet: request }) => {
        if (initialState) {
            player.respond(
                Response.forRequest(request)
                    .setPayload(monopolypb.GetInitialStateResponse, initialState)
                    .build(),
            );
        } else {
            player.respond(
                Response.forRequest(request)
                    .setFailure('Failed to get initial state because game is still loading.')
                    .build(),
            );
        }
    });

    const readyPlayers = useStored(new Set<string>());
    const [done, setDone] = useLocalState(false);

    useEventHandler(actionPacketEvent(Action.READY_TO_START_GAME), ({ player }) => {
        const gamePlayer = getGamePlayer(player);
        if (!gamePlayer) {
            return;
        }
        if (readyPlayers.current.has(gamePlayer.id)) {
            return;
        }
        readyPlayers.current.add(gamePlayer.id);
        const inspector = run(PlayingAnimation, {
            animation: Anim.sequence(
                Anim.create('game_start').setLength(animationMap.game_start),
                Anim.create('pan', monopolypb.PanExtra)
                    .setExtra({
                        target: getGamePlayer(turnOrder.getCurrentPlayer())?.pathTile?.get()
                            .position,
                    })
                    .setLength(300),
            ),
            player: gamePlayer,
            turnOrder,
        });
        if (readyPlayers.current.size === turnOrder.size) {
            // all player ready to start, we will wait for last
            // ready-to-start player to finish animation.
            inspector.onComplete(() => setDone(true));
        }
        return inspector.exit;
    });

    const leftPlayer = usePlayerLeaveEvent(turnOrder);
    if (leftPlayer) {
        return newState(GameOverState, { turnOrder });
    }

    if (done) {
        return newState(PreRollState, { turnOrder });
    }
}
