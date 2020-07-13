import { createEvent } from '@prisel/client';
import { Animation, AnimationArgs, AnimationName } from '@prisel/monopoly-common';
import { EventEmitter } from 'events';

export function createAnimationEvent<K extends AnimationName>(animationName: K) {
    return createEvent<Animation<AnimationArgs[K]>>(animationName);
}

export const animEmitter = new EventEmitter();
