import { log } from './log';

export function exist<T>(
    a: T | undefined | null,
    message: string | undefined = undefined,
    severe: boolean = false,
): a is T {
    return !(a === undefined || a === null);
}

export function existOrLog<T>(
    a: T | undefined | null,
    message: string,
    severe: boolean = false,
): a is T {
    if (a === undefined || a === null) {
        if (severe) {
            log.severe(message);
        } else {
            log.warning(message);
        }

        return false;
    }

    return true;
}

export function existOrThrow<T>(a: T | undefined | null, message: string): a is T {
    if (a === undefined || a === null) {
        throw new Error(message);
    }

    return true;
}
