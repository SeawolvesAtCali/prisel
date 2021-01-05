import { property } from '@prisel/protos';
import deepCopy from 'deepcopy';
import { hasMixin, serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

export interface PropertyLevelMixin {
    propertyLevel: {
        current: number;
        levels: property.PropertyLevel[];
    };
}

export interface SerializedPropertyLevelMixin extends PropertyLevelMixin {}

export const PropertyLevelMixinConfig: MixinConfig<
    PropertyLevelMixin,
    SerializedPropertyLevelMixin,
    'propertyLevel'
> = {
    type: 'propertyLevel',
    serialize(object) {
        if (hasMixin(object, PropertyLevelMixinConfig)) {
            return {
                propertyLevel: deepCopy(object.propertyLevel),
            };
        }
    },
    deserialize(serialized) {
        if (serializedHasMixin(serialized, PropertyLevelMixinConfig)) {
            return {
                propertyLevel: deepCopy(serialized.propertyLevel),
            };
        }
    },
};
