import { Coordinate } from '../common/types';

export function samePos(pos1: Coordinate, pos2: Coordinate): boolean {
    if (!pos1 || !pos2) {
        return false;
    }
    return pos1.row === pos2.row && pos1.col === pos2.col;
}

export function getRand<T>(list: T[]): T {
    if (list.length > 0) {
        return list[Math.trunc(Math.random() * list.length)];
    }
    return null;
}
