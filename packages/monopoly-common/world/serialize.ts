import { GameObject } from './GameObject';
import { Id } from './Id';
import { hasMixin } from './mixins/hasMixin';
import { MixinConfig } from './mixins/MixinConfig';

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
