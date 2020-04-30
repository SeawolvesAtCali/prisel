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

export function playAnimation(node: cc.Node, animationName: string): Promise<never> {
    return new Promise((resolve, reject) => {
        const animationComp = node.getComponent(cc.Animation);
        if (!animationComp) {
            reject(new Error('cannot find animation component'));
        }
        animationComp.play(animationName);
        const offListeners = () => {
            animationComp.off('stop', offListeners);
            animationComp.off('finished', offListeners);
        };
        animationComp.on('stop', () => {
            offListeners();
            resolve();
        });
        animationComp.on('finished', () => {
            offListeners();
            resolve();
        });
    });
}

export function toVec2(vec: cc.Vec3): cc.Vec2 {
    return cc.v2(vec.x, vec.y);
}

export function nullCheck<T>(value: T): T {
    if (value === null || value === undefined) {
        throw new Error('checking value not empty, but is ' + value);
    }
    return value;
}
