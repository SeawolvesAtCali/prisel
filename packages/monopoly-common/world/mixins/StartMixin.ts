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
                start: { ...object.start },
            };
        }
    },
    deserialize(serialized) {
        if (serializedHasMixin(serialized, StartMixinConfig)) {
            return {
                start: { ...serialized.start },
            };
        }
    },
};
