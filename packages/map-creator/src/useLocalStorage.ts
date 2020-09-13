import React from 'react';
import { clearValue, readValueFromStorage, saveValueToStorage } from './browserStorage';

/**
 * use state, but also save to localStorage whenever value change
 * @param key
 * @param defaultValue
 */
export function useLocalStorage<T>(
    key: string,
    defaultValue: T,
): [T, (newValue: T) => void, () => void] {
    React.useDebugValue(key);
    const storedValue = React.useMemo<T>(() => {
        const extracted = readValueFromStorage(key);
        if (extracted === null) {
            // value is not set
            return defaultValue;
        }
        return JSON.parse(extracted);
    }, [key, defaultValue]);
    const [state, setState] = React.useState(storedValue);
    const setValue = React.useCallback(
        (newValue: T) => {
            setState(newValue);
            saveValueToStorage(key, JSON.stringify(newValue));
        },
        [key],
    );
    const removeValue = React.useCallback(() => {
        setState(defaultValue);
        clearValue(key);
    }, [key, defaultValue]);
    return [state, setValue, removeValue];
}
