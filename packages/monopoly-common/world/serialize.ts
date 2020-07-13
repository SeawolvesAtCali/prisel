import { GameObject } from './GameObject';
import { hasMixin } from './hasMixin';
import { Id } from './Id';
import { MixinConfig } from './MixinConfig';

export function serialize<GameObjectType extends GameObject>(
    object: GameObjectType,
    configs: Array<MixinConfig<any, any, any>>,
): Serialized<GameObjectType> {
    const serialized = {
        id: object.id,
        type: object.type,
    };
    for (const config of configs) {
        if (hasMixin(object, config)) {
            Object.assign(serialized, config.serialize(object) || {});
        }
    }
    return serialized;
}

export type Serialized<GameObjectType extends GameObject = GameObject> = {
    id: Id<GameObjectType>;
    type: GameObjectType['type'];
    [key: string]: any;
};
