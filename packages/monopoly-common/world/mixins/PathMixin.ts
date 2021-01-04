import { Id } from '../Id';
import { Ref, RefIdSymbol } from '../Ref';
import { Tile } from '../Tile';
import { hasMixin, serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

export interface PathMixin {
    path: {
        prev: Ref<Tile>[];
        next: Ref<Tile>[];
    };
}

export interface SerializedPathMixin {
    path: {
        prev: Id<Tile>[];
        next: Id<Tile>[];
    };
}

export const PathMixinConfig: MixinConfig<PathMixin, SerializedPathMixin, 'path'> = {
    type: 'path',
    serialize(comp) {
        if (hasMixin(comp, PathMixinConfig)) {
            return {
                path: {
                    prev: comp.path.prev.map((ref) => ref[RefIdSymbol]),
                    next: comp.path.next.map((next) => next[RefIdSymbol]),
                },
            };
        }
    },
    deserialize(serialized, world) {
        if (serializedHasMixin(serialized, PathMixinConfig)) {
            return {
                path: {
                    prev: serialized.path.prev.map((id) => world.getRef(id)),
                    next: serialized.path.next.map((id) => world.getRef(id)),
                },
            };
        }
    },
};
