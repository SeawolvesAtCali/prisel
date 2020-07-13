import { getRand } from '../getRand';
import { deserialize } from './deserialize';
import { GameObject } from './GameObject';
import { hasMixin } from './hasMixin';
import { HasPropertiesMixin, HasPropertiesMixinConfig } from './HasPropertiesMixin';
import { PathMixin, PathMixinConfig } from './PathMixin';
import { PositionMixin, PositionMixinConfig } from './PositionMixin';
import { serialize, Serialized } from './serialize';
import { StartMixin, StartMixinConfig } from './StartMixin';
import { World } from './World';

/**
 * A point on the path that players follow
 * to be renamed to Tile
 */
export interface PathNode
    extends Partial<PositionMixin>,
        Partial<PathMixin>,
        Partial<HasPropertiesMixin>,
        Partial<StartMixin> {}
export class PathNode extends GameObject {
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
                  getRand(current.path?.next ?? [])?.() ?? undefined,
        );
    }

    public genPathReverse(steps: number) {
        return this.genPathWith((current, length) =>
            length === steps
                ? undefined
                : // Choose a random next
                  getRand(current.path?.prev ?? [])?.() ?? undefined,
        );
    }

    public check() {
        return hasMixin(this, PositionMixinConfig);
    }

    public serialize(): Serialized<this> {
        return serialize(this, [
            PositionMixinConfig,
            PathMixinConfig,
            HasPropertiesMixinConfig,
            StartMixinConfig,
        ]);
    }

    public static deserialize(serialized: Serialized, world: World) {
        return deserialize(
            PathNode,
            serialized,
            [PathMixinConfig, PositionMixinConfig, HasPropertiesMixinConfig, StartMixinConfig],
            world,
        );
    }
}
