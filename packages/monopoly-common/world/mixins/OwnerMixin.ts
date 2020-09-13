import { Id } from '../Id';
import { hasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

export interface OwnerMixin {
    owner: Id;
}

export interface SerializedOwnerMixin extends OwnerMixin {}

export const OwnerMixinConfig: MixinConfig<OwnerMixin, SerializedOwnerMixin, 'owner'> = {
    type: 'owner',
    serialize(object) {
        if (hasMixin(object, OwnerMixinConfig)) {
            return {
                owner: object.owner,
            };
        }
    },
    deserialize(object) {
        if (hasMixin(object, OwnerMixinConfig)) {
            return {
                owner: object.owner,
            };
        }
    },
};
