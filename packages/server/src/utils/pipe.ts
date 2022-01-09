export function pipe<T>(value: T, ...modifiers: Array<(v: T) => T>): T {
    let current = value;
    for (const modifier of modifiers) {
        current = modifier(current);
    }
    return current;
}
