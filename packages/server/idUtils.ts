/**
 * Utility functions for Id
 */

const idCounts: { [type: string]: number } = {};

export function newId<T>(type: string): T {
    if (!idCounts[type]) {
        idCounts[type] = 1;
    } else {
        idCounts[type]++;
    }
    return (`${type}-${idCounts[type]}` as unknown) as T;
}

export function parseId<T>(id: T): { type: string; number: number } {
    const idParts = ((id as unknown) as string).split('-');
    return {
        type: idParts[0],
        number: parseInt(idParts[1], 10),
    };
}
