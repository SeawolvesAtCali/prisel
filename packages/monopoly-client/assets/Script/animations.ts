import { EventEmitter } from 'events';
import { createEvent } from './packages/priselClient';
import { AnimationArgs, AnimationName, Animation } from './packages/monopolyCommon';

export function createAnimationEvent<K extends AnimationName>(animationName: K) {
    return createEvent<Animation<AnimationArgs[K]>>(animationName);
}

export const animEmitter = new EventEmitter();
