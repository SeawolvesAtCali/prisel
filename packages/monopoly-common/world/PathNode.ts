// import { deserialize, GameObject, hasMixin, serialize, Serialized, World } from '.';
import { getRand } from '../getRand';
import { deserialize } from './deserialize';
import { GameObject } from './GameObject';
import { ChancePoolMixin, ChancePoolMixinConfig } from './mixins/ChancePoolMixin';
import { hasMixin } from './mixins/hasMixin';
import { HasPropertiesMixin, HasPropertiesMixinConfig } from './mixins/HasPropertiesMixin';
import { PathMixin, PathMixinConfig } from './mixins/PathMixin';
import { PositionMixin, PositionMixinConfig } from './mixins/PositionMixin';
import { StartMixin, StartMixinConfig } from './mixins/StartMixin';
import { Ref } from './Ref';
import { serialize, Serialized } from './serialize';
import { World } from './World';

const mixinConfigs = [
    PositionMixinConfig,
    PathMixinConfig,
    HasPropertiesMixinConfig,
    StartMixinConfig,
    ChancePoolMixinConfig,
];
/**
 * A point on the path that players follow
 * to be renamed to Tile
 */
export interface PathNode
    extends Partial<PositionMixin>,
        Partial<PathMixin>,
        Partial<HasPropertiesMixin>,
        Partial<StartMixin>,
        Partial<ChancePoolMixin> {}
export class PathNode extends GameObject {
    static TYPE: string = 'tile';
    public get type() {
        return 'tile';
    }

    /**
     * generate path not including current node using genNextPathNode funtion.If
     * the function return undefined, generation is stopped.
     */
    public genPathWith(
        getNextPathNode: (currentPathNode: PathNode, length: number) => PathNode | undefined,
    ): PathNode[] {
        const path: PathNode[] = [];
        let current: PathNode = this;
        while (true) {
            const next = getNextPathNode(current, path.length);
            if (next) {
                path.push(next);
                current = next;
            } else {
                break;
            }
        }
        return path;
    }

    public genPath(steps: number) {
        return this.genPathWith((current, length) =>
            length === steps
                ? undefined
                : // Choose a random next
                  getRand((current.path?.next as Ref<PathNode>[]) ?? [])?.() ?? undefined,
        );
    }

    public genPathReverse(steps: number) {
        return this.genPathWith((current, length) =>
            length === steps
                ? undefined
                : // Choose a random next
                  getRand((current.path?.prev as Ref<PathNode>[]) ?? [])?.() ?? undefined,
        );
    }

    public check() {
        return hasMixin(this, PositionMixinConfig);
    }

    public serialize(): Serialized<this> {
        return serialize(this, mixinConfigs);
    }

    public static deserialize(serialized: Serialized, world: World) {
        return deserialize(PathNode, serialized, mixinConfigs, world);
    }
}
