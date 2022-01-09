import { Event, useEvent, useSideEffect, useStored } from '@prisel/state';

export function useEventHandler<T>(
    event: Event<T>,
    eventHandler: (eventResult: T) => void,
    additionalDeps: any[] = [],
    once: boolean = false,
) {
    const eventRef = useEvent(event);
    const expired = useStored(false);
    useSideEffect(() => {
        const shouldBailDueToExpired = eventRef && once && expired.current;
        if (eventRef && !shouldBailDueToExpired) {
            expired.current = true;
            eventHandler(eventRef.value);
        }
    }, [eventRef, ...additionalDeps]);
}
