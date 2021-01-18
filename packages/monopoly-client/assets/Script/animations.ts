import { createArgEvent } from '@prisel/client';
import { animationMap } from '@prisel/monopoly-common';
import { animation_spec } from '@prisel/protos';
import { EventEmitter } from 'events';

export const animEmitter = new EventEmitter();

export function subscribeAnimation(
    animationName: keyof typeof animationMap,
    callback: (arg: animation_spec.Animation) => unknown,
) {
    createArgEvent<animation_spec.Animation>(animationName, animEmitter).sub(callback);
}
