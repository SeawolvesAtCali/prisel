import { GameObject } from './GameObject';
import { Id } from './Id';
export const RefIdSymbol = Symbol('refId');
export interface Ref<T extends GameObject> {
    (): T | null;
    [RefIdSymbol]: Id<T>;
}
