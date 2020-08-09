export function isNotNullRef<T>(nullableRef: { current: T | null }): nullableRef is { current: T } {
    return nullableRef.current !== null;
}
