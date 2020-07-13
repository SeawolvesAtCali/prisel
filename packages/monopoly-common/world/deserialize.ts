import { GameObject } from './GameObject';
import { serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';
import { Serialized } from './serialize';
import { World } from './World';

function applyDeserialized<
    MixinType,
    GameObjectType extends GameObject & MixinType,
    SerializedMixinType
>(
    object: GameObjectType,
    serialized: any,
    config: MixinConfig<MixinType, SerializedMixinType, any>,
    world: World,
) {
    if (serializedHasMixin(serialized, config)) {
        Object.assign(object, config.deserialize(serialized, world));
    }
}

export function deserialize<T extends GameObject>(
    clazz: new () => T,
    serialized: Serialized,
    configs: Array<MixinConfig<any, any, any>>,
    world: World,
): T {
    const object = world.create(clazz, serialized.id);
    for (const config of configs) {
        applyDeserialized(object, serialized, config, world);
    }
    return object;
}
