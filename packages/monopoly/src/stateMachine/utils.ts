import {
    Action,
    animationMap,
    computeAnimationLength,
    GamePlayer,
    toAnimationPacket,
} from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import {
    broadcast,
    newTag,
    Packet,
    Player,
    playerLeaveEvent,
    RequestBuilder,
    Response,
    TurnOrder,
    useEventHandler,
} from '@prisel/server';
import {
    endState,
    Event,
    EventResult,
    getAmbient,
    hasAmbient,
    newAmbient,
    useComputed,
    useEvent,
    useLocalState,
    useSideEffect,
    useStored,
} from '@prisel/state';
import Game from '../Game';
import { getPlayer } from '../utils';

const [gameAmbient, _provideGame] = newAmbient<Game>('game');

export const getGame = () => getAmbient(gameAmbient);
export const hasGame = () => hasAmbient(gameAmbient);
export const provideGame = _provideGame;

export const [setGamePlayer, getGamePlayer] = newTag<Player, GamePlayer>('gameplayer-tag');

export function getPanAnimationLength(from: monopolypb.Coordinate, to: monopolypb.Coordinate) {
    return Math.trunc(
        Math.sqrt(Math.pow(from.row - to.row, 2) + Math.pow(from.col - to.col, 2)) *
            animationMap.pan,
    );
}

export function AnimatingCurrentPlayer(props: {
    animation: monopolypb.Animation;
    turnOrder: TurnOrder;
}) {
    const { animation, turnOrder } = props;
    const currentPlayer = getGamePlayer(turnOrder.getCurrentPlayer());
    if (!currentPlayer) {
        return endState();
    }
    return PlayingAnimation({
        animation,
        player: getGamePlayer(turnOrder.getCurrentPlayer()),
        turnOrder,
    });
}

export function PlayingAnimation(props: {
    animation: monopolypb.Animation;
    player?: GamePlayer;
    turnOrder: TurnOrder;
}) {
    const { animation, player, turnOrder } = props;
    const [animationDone, setAnimationDone] = useLocalState(false);
    useSideEffect(() => {
        if (player) {
            getPlayer(player).emit(toAnimationPacket(animation));
        } else {
            broadcast(turnOrder.getAllPlayers(), toAnimationPacket(animation));
        }
        const length = computeAnimationLength(animation);
        if (length === Infinity) {
            setAnimationDone(true);
        } else {
            const timeoutId = setTimeout(() => {
                setAnimationDone(true);
            }, length);
            return () => clearTimeout(timeoutId);
        }
    }, []);

    if (animationDone) {
        return endState();
    }
}

export function usePlayerLeaveEvent(turnOrder: TurnOrder): GamePlayer | undefined {
    const eventResult = useEvent(playerLeaveEvent);
    useEventHandler(playerLeaveEvent, (player) => {
        const gamePlayer = getGamePlayer(player);
        if (gamePlayer) {
            broadcast(
                turnOrder.getAllPlayers(),
                Packet.forAction(Action.ANNOUNCE_PLAYER_LEFT)
                    .setPayload(monopolypb.AnnouncePlayerLeftPayload, {
                        player: gamePlayer.getGamePlayerInfo(),
                    })
                    .build(),
            );
        }
    });
    if (eventResult) {
        return getGamePlayer(eventResult.value);
    }
    return undefined;
}

export function Requesting(props: {
    player: GamePlayer;
    request: RequestBuilder;
    callback: (response: Response) => unknown;
}) {
    const { player, request, callback } = props;
    const [done, setDone] = useLocalState(false);
    useSideEffect(() => {
        let active = true;
        getPlayer(player).request(request, (response) => {
            if (active) {
                callback(response);
                setDone(true);
            }
            return () => {
                active = false;
            };
        });
    }, []);
    if (done) {
        return endState();
    }
}

export function useCallback<T>(func: T & Function, deps?: any[]): T {
    const stored = useComputed(() => func, deps);
    return stored;
}

export function useOnetimeEvent<T>(event: Event<T>) {
    const eventData = useEvent(event);
    const triggered = useStored<EventResult<T> | null>(null);
    if (eventData && triggered.current === null) {
        triggered.current = eventData;
    }
    return triggered.current;
}
