import { Tile } from '../Tile';
import { World } from '../World';

test('id', () => {
    const world = new World();
    const node = world.create(Tile);
    expect(node.id).toBeTruthy();
});

test('ref', () => {
    const world = new World();
    const node = world.create(Tile);
    const ref = world.makeRef(node);
    expect(ref.get()).toBe(node);
});

test('ref with id', () => {
    const world = new World();
    const node = world.create(Tile, '123');
    const ref = world.makeRef('123');
    expect(ref.get()).toBe(node);
});

test('create and check', () => {
    const world = new World();
    const tile = world.create(Tile, '123');
    tile.position = {
        row: 1,
        col: 2,
    };
    expect(tile.check()).toBe(true);
});
