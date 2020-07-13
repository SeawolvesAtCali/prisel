import { hasMixin, serializedHasMixin } from './hasMixin';
import { Id } from './Id';
import { MixinConfig } from './MixinConfig';
import { PathNode } from './PathNode';
import { Ref, RefIdSymbol } from './Ref';

export interface PathMixin {
    path: {
        prev: Ref<PathNode>[];
        next: Ref<PathNode>[];
    };
}

export interface SerializedPathMixin {
    path: {
        prev: Id<PathNode>[];
        next: Id<PathNode>[];
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
                    prev: serialized.path.prev.map((id) => world.getRef(PathNode, id)),
                    next: serialized.path.next.map((id) => world.getRef(PathNode, id)),
                },
            };
        }
    },
};
