import { coordinate } from '@prisel/protos';
import deepCopy from 'deepcopy';
import { Size } from '../../types/size';
import { hasMixin, serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

export interface DimensionMixin {
    dimension: {
        anchor: coordinate.Coordinate;
        size: Size;
    };
}

export interface SerializedDimensionMixin {
    dimension: {
        anchor: coordinate.Coordinate;
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
                dimension: deepCopy(object.dimension),
            };
        }
    },
    deserialize(serialized) {
        if (serializedHasMixin(serialized, DimensionMixinConfig)) {
            return {
                dimension: deepCopy(serialized.dimension),
            };
        }
    },
};
