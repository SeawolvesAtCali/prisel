import { Id } from '../Id';
import { Ref, RefIdSymbol } from '../Ref';
import { Tile2 } from '../Tile2';
import { hasMixin, serializedHasMixin } from './hasMixin';
import { MixinConfig } from './MixinConfig';

export interface PathMixin {
    path: {
        prev: Ref<Tile2>[];
        next: Ref<Tile2>[];
    };
}

export interface SerializedPathMixin {
    path: {
        prev: Id<Tile2>[];
        next: Id<Tile2>[];
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
