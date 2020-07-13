import { Coordinate } from '../types';
import { hasMixin, serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

export interface PositionMixin {
    position: Coordinate;
}

export type SerializedPositionMixin = PositionMixin;

export const PositionMixinConfig: MixinConfig<
    PositionMixin,
    SerializedPositionMixin,
    'position'
> = {
    type: 'position',
    serialize(comp) {
        if (hasMixin(comp, PositionMixinConfig)) {
            return {
                position: {
                    row: comp.position.row,
                    col: comp.position.col,
                },
            };
        }
    },
    deserialize(serialized) {
        if (serializedHasMixin(serialized, PositionMixinConfig)) {
            return {
                position: {
                    row: serialized.position.row,
                    col: serialized.position.col,
                },
            };
        }
    },
};
