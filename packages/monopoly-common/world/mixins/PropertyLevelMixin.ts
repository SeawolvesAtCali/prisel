import { PropertyLevel } from '../../types';
import { hasMixin, serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

export interface PropertyLevelMixin {
    propertyLevel: {
        current: number;
        levels: PropertyLevel[];
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
                propertyLevel: {
                    current: object.propertyLevel.current,
                    levels: object.propertyLevel.levels.map((level) => ({ ...level })),
                },
            };
        }
    },
    deserialize(serialized) {
        if (serializedHasMixin(serialized, PropertyLevelMixinConfig)) {
            return {
                propertyLevel: {
                    current: serialized.propertyLevel.current,
                    levels: serialized.propertyLevel.levels.map((level) => ({ ...level })),
                },
            };
        }
    },
};
