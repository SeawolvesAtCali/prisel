import { AnimationName } from '../animationSpec';

export enum AnimationType {
    DEFAULT,
    SEQUENCE, // container that plays child animations one by one
    RACE, // container that plays child animations and finish when one of them finishes. Other animations are truncated if possible
    ALL, // container that plays child animations and wait for the longest one to finish.
}
export interface Animation<ArgType = any> {
    name?: AnimationName; // name of the individual animation,
    type: AnimationType;
    args?: ArgType;
    length?: number; // duration, specified when type is DEFAULT
    children?: Animation[];
}
