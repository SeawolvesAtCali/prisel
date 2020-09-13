import { GameObject, GameObjectClass } from './GameObject';
import { serializedHasMixin } from './mixins/hasMixin';
import { MixinConfig } from './mixins/MixinConfig';
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

export function deserialize<ClassT extends GameObjectClass<any>>(
    clazz: ClassT,
    serialized: Serialized,
    configs: Array<MixinConfig<any, any, any>>,
    world: World,
): InstanceType<ClassT> {
    const object = world.create(clazz, serialized.id);
    for (const config of configs) {
        applyDeserialized(object, serialized, config, world);
    }
    return object;
}
