import { RefIdSymbol, Tile, World } from '@prisel/monopoly-common';
import { ensurePath } from './ensurePath';

export function pathConnect(from: Tile, to: Tile, world: World) {
    const fromWithPath = ensurePath(from);
    const toWithPath = ensurePath(to);
    if (!fromWithPath.path.next.some((ref) => ref[RefIdSymbol] === to.id)) {
        fromWithPath.path.next = [...fromWithPath.path.next, world.getRef(toWithPath)];
    }
    if (!toWithPath.path.next.some((ref) => ref[RefIdSymbol] === from.id)) {
        toWithPath.path.prev = [...toWithPath.path.prev, world.getRef(fromWithPath)];
    }
}
