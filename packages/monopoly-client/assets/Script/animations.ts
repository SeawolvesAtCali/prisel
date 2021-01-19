import { createArgEvent } from '@prisel/client';
import { animationMap } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { EventEmitter } from 'events';

export const animEmitter = new EventEmitter();

export function subscribeAnimation(
    animationName: keyof typeof animationMap,
    callback: (arg: monopolypb.Animation) => unknown,
) {
    createArgEvent<monopolypb.Animation>(animationName, animEmitter).sub(callback);
}
