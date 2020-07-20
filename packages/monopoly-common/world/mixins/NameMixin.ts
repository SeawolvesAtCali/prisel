import { hasMixin, serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

export interface NameMixin {
    name: string;
}

export interface SerializedNameMixin extends NameMixin {}

export const NameMixinConfig: MixinConfig<NameMixin, SerializedNameMixin, 'name'> = {
    type: 'name',
    serialize(object) {
        if (hasMixin(object, NameMixinConfig)) {
            return {
                name: object.name,
            };
        }
    },
    deserialize(serialized) {
        if (serializedHasMixin(serialized, NameMixinConfig)) {
            return {
                name: serialized.name,
            };
        }
    },
};
