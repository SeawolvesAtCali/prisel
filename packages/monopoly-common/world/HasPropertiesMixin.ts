import { hasMixin, serializedHasMixin } from './hasMixin';
import { Id } from './Id';
import { MixinConfig } from './MixinConfig';
import { Property } from './Property';
import { Ref, RefIdSymbol } from './Ref';
import { World } from './World';

export interface HasPropertiesMixin {
    hasProperties: Ref<Property>[];
}

export interface SerializedHasPropertiesMixin {
    hasProperties: Id<Property>[];
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
                hasProperties: serialized.hasProperties.map((id) => world.getRef(Property, id)),
            };
        }
    },
};
