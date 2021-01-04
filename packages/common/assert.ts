export function assert(condition: boolean, message: string): true {
    if (!condition) {
        throw new Error(message);
    }
    return true;
}

export function assertExist<T>(a: T, nameOfObject?: string): NonNullable<T> {
    assert(
        a !== undefined,
        `Expect ${nameOfObject || 'value'} to be not undefined but is undefined`,
    );
    assert(a !== null, `Expect ${nameOfObject || 'value'} to be not null, but is null`);
    return a as NonNullable<T>;
}
