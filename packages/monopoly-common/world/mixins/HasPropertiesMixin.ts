import { Id } from '../Id';
import { Property2 } from '../Property';
import { Ref, RefIdSymbol } from '../Ref';
import { World } from '../World';
import { hasMixin, serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

export interface HasPropertiesMixin {
    hasProperties: Ref<Property2>[];
}

export interface SerializedHasPropertiesMixin {
    hasProperties: Id<Property2>[];
}

export const HasPropertiesMixinConfig: MixinConfig<
    HasPropertiesMixin,
    SerializedHasPropertiesMixin,
    'hasProperties'
> = {
    type: 'hasProperties',
    serialize(object) {
        if (hasMixin(object, HasPropertiesMixinConfig)) {
            return {
                hasProperties: object.hasProperties.map((ref) => ref[RefIdSymbol]),
            };
        }
    },
    deserialize(serialized, world: World) {
        if (serializedHasMixin(serialized, HasPropertiesMixinConfig)) {
            return {
                hasProperties: serialized.hasProperties.map((id) => world.getRef(id)),
            };
        }
    },
};
