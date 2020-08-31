import { TypedEvent, TypedEventWithArg } from '@prisel/common';
import React from 'react';

export function useTypedEvent<T extends TypedEvent | TypedEventWithArg<any>>(
    event: T,
    callback: Parameters<T['sub']>[0],
) {
    const unsubRef = React.useRef(() => {});
    React.useMemo(() => {
        const newRemoveListener = event.sub(callback as any);
        unsubRef.current();
        unsubRef.current = newRemoveListener;
    }, [callback, event]);
}
