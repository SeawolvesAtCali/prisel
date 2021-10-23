import {
    Action,
    animationMap,
    computeAnimationLength,
    GamePlayer,
    toAnimationPacket,
} from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { Packet, RequestBuilder, Response } from '@prisel/server';
import {
    endState,
    Event,
    getAmbient,
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
export const provideGame = _provideGame;

const [currentPlayerAmbient, _provideCurrentPlayer] = newAmbient<GamePlayer>('current-player');

export const getCurrentPlayer = () => getAmbient(currentPlayerAmbient);
export const provideCurrentPlayer = _provideCurrentPlayer;

export function getPanAnimationLength(from: monopolypb.Coordinate, to: monopolypb.Coordinate) {
    return Math.trunc(
        Math.sqrt(Math.pow(from.row - to.row, 2) + Math.pow(from.col - to.col, 2)) *
            animationMap.pan,
    );
}

export interface PacketEventData {
    packet: Packet;
    player: GamePlayer;
}

export const [receivedPacketEventAmbient, provideReceivedPacketEvent] = newAmbient<
    Event<PacketEventData>
>('received-packet-event-ambient');

export const [playerLeftEventAmbient, providePlayerLeftEvent] = newAmbient<Event<GamePlayer>>(
    'player-left-event-ambient',
);

export function AnimatingCurrentPlayer(props: monopolypb.Animation) {
    return PlayingAnimation({
        animation: props,
        player: getCurrentPlayer(),
    });
}

export function AnimatingAllPlayers(props: monopolypb.Animation) {
    return PlayingAnimation({
        animation: props,
    });
}

export function PlayingAnimation(props: { animation: monopolypb.Animation; player?: GamePlayer }) {
    const game = getGame();
    const { animation, player } = props;
    const [animationDone, setAnimationDone] = useLocalState(false);
    useSideEffect(() => {
        if (player) {
            getPlayer(player).emit(toAnimationPacket(animation));
        } else {
            game.broadcast(toAnimationPacket(animation));
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

export function useActiveCheck() {
    const activeRef = useStored(true);
    useSideEffect(() => {
        return () => {
            activeRef.current = false;
        };
    }, []);
    return activeRef;
}

export function usePlayerLeaveEvent(): GamePlayer | void {
    const playerLeaveEvent = useEvent(getAmbient(playerLeftEventAmbient));
    const game = getGame();
    useSideEffect(() => {
        if (playerLeaveEvent) {
            game.broadcast(
                Packet.forAction(Action.ANNOUNCE_PLAYER_LEFT)
                    .setPayload(monopolypb.AnnouncePlayerLeftPayload, {
                        player: playerLeaveEvent.value.getGamePlayerInfo(),
                    })
                    .build(),
            );
        }
    });
    if (playerLeaveEvent) {
        return playerLeaveEvent.value;
    }
}

export function Requesting(props: {
    player: GamePlayer;
    request: RequestBuilder;
    callback: (response: Response) => unknown;
}) {
    const active = useActiveCheck();
    const { player, request, callback } = props;
    const [done, setDone] = useLocalState(false);
    useSideEffect(() => {
        getPlayer(player).request(request, (response) => {
            if (active.current) {
                callback(response);
                setDone(true);
            }
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
