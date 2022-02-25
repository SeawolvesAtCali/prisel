import { Event, useEvent, useSideEffect } from '@prisel/state';

export function useEventHandler<T>(event: Event<T>, eventHandler: (eventResult: T) => void) {
    const eventResult = useEvent(event);
    useSideEffect(() => {
        if (eventResult) {
            eventHandler(eventResult.value);
        }
    }, [eventResult]);
}
