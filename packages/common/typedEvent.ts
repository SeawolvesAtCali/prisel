import events from 'events';

export interface TypedEvent {
    pub: () => void;
    sub: (callback: () => unknown) => () => void;
    event: string;
    emitter: events.EventEmitter;
}

export function createEvent(
    event: string,
    emitter: events.EventEmitter = new events.EventEmitter(),
): TypedEvent {
    return {
        pub: () => {
            emitter.emit(event);
        },
        sub: (callback: () => unknown) => {
            emitter.on(event, callback);
            return () => emitter.removeListener(event, callback);
        },
        event,
        emitter,
    };
}
export interface TypedEventWithArg<Arg> {
    pub: (arg: Arg) => void;
    sub: (callback: (arg: Arg) => unknown) => () => void;
    event: string;
    emitter: events.EventEmitter;
}

export function createArgEvent<Arg = never>(
    event: string,
    emitter: events.EventEmitter = new events.EventEmitter(),
): TypedEventWithArg<Arg> {
    return {
        pub: (arg: Arg) => {
            emitter.emit(event, arg);
        },
        sub: (callback: (arg: Arg) => void) => {
            emitter.on(event, callback);
            return () => emitter.removeListener(event, callback);
        },
        event,
        emitter,
    };
}
