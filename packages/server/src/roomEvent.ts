import { Emitter, Event, getAmbient, newEvent } from '@prisel/state';
import { roomIdAmbient } from './ambients';
import { Player } from './player';

export function newRoomEvent<T = void>(name: string): [Event<T>, Emitter<T>] {
    const [event, emitter] = newEvent<{ roomId: string; value: T }>(name);

    return [
        event.filter((e) => e.roomId === getAmbient(roomIdAmbient)).map((e) => e.value),
        {
            ref: event.ref,
            send: ((event?: any) =>
                emitter.send({
                    roomId: getAmbient(roomIdAmbient),
                    value: event,
                })) as Emitter<T>['send'],
        },
    ];
}

/**
 * Event fired when a player joins the room.
 */
export const [playerJoinEvent, emitPlayerJoinEvent] = newRoomEvent<Player>('player-join-room');
/**
 * Event fired when a player leaves the room.
 */
export const [playerLeaveEvent, emitPlayerLeaveEvent] = newRoomEvent<Player>('player-leave-room');
