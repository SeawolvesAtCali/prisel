import { coordinate } from '@prisel/protos';

export function samePos(posA: coordinate.Coordinate, posB: coordinate.Coordinate) {
    return posA && posB && posA.row === posB.row && posA.col === posB.col;
}
