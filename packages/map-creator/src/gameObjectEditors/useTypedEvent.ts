import { TypedEvent, TypedEventWithArg } from '@prisel/common';
import React from 'react';

export function useTypedEvent<T extends TypedEvent | TypedEventWithArg<any>>(
    event: T,
    callback: Parameters<T['sub']>[0],
) {
    React.useDebugValue(event.event);
    React.useLayoutEffect(() => {
        if (callback) {
            const removeListener = event.sub(callback as any);
            return removeListener;
        }
    }, [event, callback]);
}
