export function getRand<T>(list: T[]): T | undefined {
    if (list.length > 0) {
        return list[Math.trunc(Math.random() * list.length)];
    }
    return;
}
