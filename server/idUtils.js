// @flow

/**
 * Utility functions for Id
 */

const idCounts = {};

function newId(type: string): string {
    if (!idCounts[type]) {
        idCounts[type] = 1;
    } else {
        idCounts[type]++;
    }
    return `${type}-${idCounts[type]}`;
}

function parseId(id: string): { type: string, number: number } {
    const idParts = id.split('-');
    return {
        type: idParts[0],
        number: parseInt(idParts[1], 10),
    };
}

module.exports = {
    newId,
    parseId,
};
