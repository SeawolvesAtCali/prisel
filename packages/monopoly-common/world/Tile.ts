import { monopolypb } from '@prisel/protos';
import { serializable } from 'serializr';
import { getRand } from '../getRand';
import { ChanceInput, TileEffectInput } from '../types';
import { GameObject } from './GameObject';
import { Property } from './Property';
import { Ref } from './ref2';
import { listRefSerializable, raw } from './serializeUtil';

export class Tile extends GameObject {
    static TYPE = 'tile';
    readonly type = 'tile';

    @raw
    position: monopolypb.Coordinate = { row: -1, col: -1 };

    @listRefSerializable
    prev: Ref<Tile>[] = [];

    @listRefSerializable
    next: Ref<Tile>[] = [];

    @listRefSerializable
    hasProperties: Ref<Property>[] = [];

    @serializable
    isStart = false;

    @raw
    chancePool?: ChanceInput<any>[];

    @raw
    tileEffect?: TileEffectInput<any>;

    /**
     * generate path not including current node using genNextPathTile funtion.If
     * the function return undefined, generation is stopped.
     */
    genPathWith(
        genNextPathTile: (currentPathTile: Tile, length: number) => Tile | undefined,
    ): Tile[] {
        const path: Tile[] = [];
        let current: Tile = this;
        while (true) {
            const next = genNextPathTile(current, path.length);
            if (next) {
                path.push(next);
                current = next;
            } else {
                break;
            }
        }
        return path;
    }

    genPath(steps: number) {
        return this.genPathWith((current, length) =>
            length === steps
                ? undefined
                : // Choose a random next
                  getRand(current.next)?.get(),
        );
    }

    genPathReverse(steps: number) {
        return this.genPathWith((current, length) =>
            length === steps
                ? undefined
                : // Choose a random next
                  getRand(current.prev)?.get(),
        );
    }

    hasPath() {
        return this.prev.length > 0 || this.next.length > 0;
    }
}
