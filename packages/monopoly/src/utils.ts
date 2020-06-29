import { Coordinate } from '@prisel/monopoly-common';

export function samePos(pos1: Coordinate, pos2: Coordinate): boolean {
    if (!pos1 || !pos2) {
        return false;
    }
    return pos1.row === pos2.row && pos1.col === pos2.col;
}

export function getRand<T>(list: T[]): T | undefined {
    if (list.length > 0) {
        return list[Math.trunc(Math.random() * list.length)];
    }
    return;
}

export function checkType<T>(a: T): T {
    return a;
}
