import { ChanceInput } from '../../types';
import { hasMixin, serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

export interface ChancePoolMixin {
    chancePool: ChanceInput<any>[];
}

export interface SerializedChancePoolMixin extends ChancePoolMixin {}

export const ChancePoolMixinConfig: MixinConfig<
    ChancePoolMixin,
    SerializedChancePoolMixin,
    'chancePool'
> = {
    type: 'chancePool',
    serialize(object) {
        if (hasMixin(object, ChancePoolMixinConfig)) {
            return {
                chancePool: object.chancePool.slice(),
            };
        }
    },
    deserialize(serialized) {
        if (serializedHasMixin(serialized, ChancePoolMixinConfig)) {
            return {
                chancePool: serialized.chancePool.slice(),
            };
        }
    },
};
