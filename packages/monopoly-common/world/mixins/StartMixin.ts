import deepCopy from 'deepcopy';
import { hasMixin, serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

/**
 * Denote if a tile is a start tile.
 */
export interface StartMixin {
    start: {};
}

export interface SerializedStartMixin extends StartMixin {}

export const StartMixinConfig: MixinConfig<StartMixin, SerializedStartMixin, 'start'> = {
    type: 'start',
    serialize(object) {
        if (hasMixin(object, StartMixinConfig)) {
            return {
                start: deepCopy(object.start),
            };
        }
    },
    deserialize(serialized) {
        if (serializedHasMixin(serialized, StartMixinConfig)) {
            return {
                start: deepCopy(serialized.start),
            };
        }
    },
};
