import { World } from './World';

export interface MixinConfig<T, SerializedT, Type extends keyof T & keyof SerializedT> {
    type: Type;
    serialize(object: T): SerializedT | undefined;
    deserialize(serialized: SerializedT, world: World): T | undefined;
}
