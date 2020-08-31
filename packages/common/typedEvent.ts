import events from 'events';

export interface TypedEvent {
    pub: () => void;
    sub: (callback: () => unknown) => () => void;
}

export function createEvent(event: string | number): TypedEvent {
    const emitter = new events.EventEmitter();
    return {
        pub: () => {
            emitter.emit(event);
        },
        sub: (callback: () => unknown) => {
            emitter.on(event, callback);
            return () => emitter.removeListener(event, callback);
        },
    };
}
export interface TypedEventWithArg<Arg> {
    pub: (arg: Arg) => void;
    sub: (callback: (arg: Arg) => unknown) => () => void;
}

export function createArgEvent<Arg = never>(event: any): TypedEventWithArg<Arg> {
    const emitter = new events.EventEmitter();
    return {
        pub: (arg: Arg) => {
            emitter.emit(event, arg);
        },
        sub: (callback: (arg: Arg) => void) => {
            emitter.on(event, callback);
            return () => emitter.removeListener(event, callback);
        },
    };
}
