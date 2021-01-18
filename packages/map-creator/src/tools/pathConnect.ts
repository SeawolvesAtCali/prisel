import { Tile, World } from '@prisel/monopoly-common';

export function pathConnect(from: Tile, to: Tile, world: World) {
    if (!from.next.some((ref) => ref.id === to.id)) {
        from.next = [...from.next, world.makeRef(to)];
    }
    if (!to.next.some((ref) => ref.id === from.id)) {
        to.prev = [...to.prev, world.makeRef(from)];
    }
}
