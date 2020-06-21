import { Coordinate } from './types';

export function samePos(posA: Coordinate, posB: Coordinate) {
    return posA && posB && posA.row === posB.row && posA.col === posB.col;
}
