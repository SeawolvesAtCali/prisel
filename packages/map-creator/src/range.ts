export function range(start: number, end: number): number[] {
    const arr = [];
    for (let i = start; i < end; i++) {
        arr.push(i);
    }
    return arr;
}
