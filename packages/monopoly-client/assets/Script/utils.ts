import { Tile, Coordinate } from './packages/monopolyCommon';

export function getTileKey(tile: Tile): string {
    return getTileKeyFromCoordinate(tile.pos);
}

export function getTileKeyFromCoordinate(coor: Coordinate): string {
    return `${coor.row}-${coor.col}`;
}

export function setZIndexAction(zIndex: number): cc.ActionInstant {
    return cc.callFunc((node: cc.Node) => {
        node.zIndex = zIndex;
    });
}

export function callOnMoveAction(
    target: cc.Vec2,
    onMove: (node: cc.Node, target: cc.Vec2) => void,
): cc.ActionInstant {
    return cc.callFunc((node: cc.Node) => {
        onMove(node, target);
    });
}

export function getRand<T>(list: T[]): T {
    if (list.length > 0) {
        return list[Math.trunc(Math.random() * list.length)];
    }
    return null;
}
