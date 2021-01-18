import { assertExist } from '@prisel/client';
import { monopolypb } from '@prisel/protos';
import { TILE_SIZE } from './consts';

export function getTileKeyFromCoordinate(coor: monopolypb.Coordinate): string {
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

export function getRand<T>(list: T[]): T | null {
    if (list.length > 0) {
        return list[Math.trunc(Math.random() * list.length)];
    }
    return null;
}

export function legacyPlayAnimation(node: cc.Node, animationName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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

const LIFECYCLE_SET = new Set([
    'onLoad',
    'start',
    'update',
    'lateUpdate',
    'onDestroy',
    'onEnable',
    'onDisable',
]);
export function lifecycle(container: any, key: string) {
    if (CC_DEBUG && !LIFECYCLE_SET.has(key)) {
        throw new Error(
            'Method ' + key + ' of ' + container.constructor.name + ' is not a lifecycle method',
        );
    }
}

export function assertNever(x: never): never {
    throw new Error('Unexpected value ' + x);
}

export function getTileAnchorPos(coor: monopolypb.Coordinate) {
    return new cc.Vec2(coor.col * TILE_SIZE, -(coor.row + 1) * TILE_SIZE);
}

export function play(comp: cc.Component, clip: string, durationInMs: number) {
    const anim = assertExist(comp.getComponent(cc.Animation));
    const animState = anim.play(clip);
    const originalDuration = animState.duration;
    animState.speed = (originalDuration * 1000) / durationInMs;
    return anim;
}

export function playPromise(
    comp: cc.Component,
    clip: string,
    durationInMs: number,
): Promise<unknown> {
    const animationComp = play(comp, clip, durationInMs);
    return new Promise<void>((resolve) => {
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
