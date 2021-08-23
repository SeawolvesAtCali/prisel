export function assert(condition: boolean, message: string): true {
    if (!condition) {
        console.trace();
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

export function assertNever(x: never): never {
    throw new Error('Unexpected value ' + x);
}

export function nonNull<T>(x: T): x is NonNullable<T> {
    return x != null;
}

export function isNull(x: any): x is undefined | null {
    return x == null;
}
