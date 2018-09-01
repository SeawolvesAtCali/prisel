/**
 * Utility functions for Id
 */

const idCounts: { [type: string]: number } = {};

export function newId(type: string): string {
    if (!idCounts[type]) {
        idCounts[type] = 1;
    } else {
        idCounts[type]++;
    }
    return `${type}-${idCounts[type]}`;
}

export function parseId(id: string): { type: string; number: number } {
    const idParts = id.split('-');
    return {
        type: idParts[0],
        number: parseInt(idParts[1], 10),
    };
}
