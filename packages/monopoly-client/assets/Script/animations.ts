import { createArgEvent } from '@prisel/client';
import { Animation, AnimationArgs, AnimationName } from '@prisel/monopoly-common';
import { EventEmitter } from 'events';

export const animEmitter = new EventEmitter();

export function createAnimationEvent<K extends AnimationName>(animationName: K) {
    return createArgEvent<Animation<AnimationArgs[K]>>(animationName, animEmitter);
}
