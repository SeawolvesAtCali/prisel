import { Action, Anim, animationMap } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Packet, Request, Response } from '@prisel/server';
import {
    getAmbient,
    newState,
    run,
    useComputed,
    useEvent,
    useLocalState,
    useSideEffect,
    useStored,
} from '@prisel/state';
import { getPlayer } from '../utils';
import { GameOverState } from './GameOver';
import { PreRollState } from './PreRoll';
import {
    getCurrentPlayer,
    getGame,
    PlayingAnimation,
    receivedPacketEventAmbient,
    usePlayerLeaveEvent,
} from './utils';

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
export function GameStartedState() {
    const game = getGame();
    const currentPlayer = getCurrentPlayer();
    const getInitialStateEvent = useEvent(
        getAmbient(receivedPacketEventAmbient).filter(
            ({ packet }) =>
                Packet.getAction(packet) === Action.GET_INITIAL_STATE && Request.isRequest(packet),
        ),
    );
    const initialState = useComputed<monopolypb.GetInitialStateResponse>(
        () => ({
            players: Array.from(game.players.values()).map((player) => player.getGamePlayerInfo()),
            firstPlayerId: currentPlayer.id,
        }),
        [],
    );
    useSideEffect(() => {
        if (getInitialStateEvent) {
            const gamePlayer = getInitialStateEvent.value.player;
            getPlayer(gamePlayer).respond(
                Response.forRequest(getInitialStateEvent.value.packet as Request)
                    .setPayload(monopolypb.GetInitialStateResponse, initialState)
                    .build(),
            );
        }
    }, [getInitialStateEvent, initialState]);

    const readyPlayers = useStored(new Set<string>());
    const readyToStartEvent = useEvent(
        getAmbient(receivedPacketEventAmbient).filter(
            ({ packet }) => Packet.getAction(packet) === Action.READY_TO_START_GAME,
        ),
    );
    const [done, setDone] = useLocalState(false);
    useSideEffect(() => {
        if (readyToStartEvent) {
            const gamePlayer = readyToStartEvent.value.player;
            if (readyPlayers.current.has(gamePlayer.id)) {
                return;
            }
            readyPlayers.current.add(gamePlayer.id);
            const inspector = run(PlayingAnimation, {
                animation: Anim.sequence(
                    Anim.create('game_start').setLength(animationMap.game_start),
                    Anim.create('pan', monopolypb.PanExtra)
                        .setExtra({
                            target: currentPlayer.pathTile?.get().position,
                        })
                        .setLength(300),
                ),
                player: gamePlayer,
            });
            if (readyPlayers.current.size === game.players.size) {
                // all player ready to start, we will wait for last
                // ready-to-start player to finish animation.
                inspector.onComplete(() => setDone(true));
            }
            return inspector.exit;
        }
    }, [readyToStartEvent]);

    const leftPlayer = usePlayerLeaveEvent();
    if (leftPlayer) {
        return newState(GameOverState);
    }

    if (done) {
        return newState(PreRollState);
    }
}
