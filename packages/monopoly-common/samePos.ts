import { monopolypb } from '@prisel/protos';

export function samePos(posA: monopolypb.Coordinate, posB: monopolypb.Coordinate) {
    return posA && posB && posA.row === posB.row && posA.col === posB.col;
}
