export function exist<T>(a: T): a is NonNullable<T> {
    return !(a === undefined || a === null);
}

export function existOrThrow<T>(a: T, message: string): a is NonNullable<T> {
    if (a === undefined || a === null) {
        throw new Error(message);
    }

    return true;
}
