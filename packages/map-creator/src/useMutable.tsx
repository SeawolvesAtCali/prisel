import React from 'react';

export function useMutable<T>(value: T): React.MutableRefObject<T> {
    const ref = React.useRef(value);
    ref.current = value;
    return ref;
}
