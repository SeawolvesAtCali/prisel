import { Coordinate } from '../../types';
import { Size } from '../../types/size';
import { hasMixin, serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

export interface DimensionMixin {
    dimension: {
        anchor: Coordinate;
        size: Size;
    };
}

export interface SerializedDimensionMixin {
    dimension: {
        anchor: Coordinate;
        size: Size;
    };
}

export const DimensionMixinConfig: MixinConfig<
    DimensionMixin,
    SerializedDimensionMixin,
    'dimension'
> = {
    type: 'dimension',
    serialize(object) {
        if (hasMixin(object, DimensionMixinConfig)) {
            return {
                dimension: {
                    anchor: { ...object.dimension.anchor },
                    size: { ...object.dimension.size },
                },
            };
        }
    },
    deserialize(serialized) {
        if (serializedHasMixin(serialized, DimensionMixinConfig)) {
            return {
                dimension: {
                    anchor: { ...serialized.dimension.anchor },
                    size: { ...serialized.dimension.size },
                },
            };
        }
    },
};
