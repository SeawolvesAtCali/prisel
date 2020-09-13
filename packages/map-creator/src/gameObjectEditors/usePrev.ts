import React from 'react';

export function usePrev<T>(currentValue: T): React.RefObject<T | undefined> {
    const prevRef = React.useRef<T>();
    React.useEffect(() => {
        prevRef.current = currentValue;
    }, [currentValue]);
    return prevRef;
}
