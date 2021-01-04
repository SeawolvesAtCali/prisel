import { TileClass } from '../Tile';
import { World } from '../World';

test('id', () => {
    const world = new World().registerObject(TileClass);
    const node = world.create(TileClass);
    expect(node.id).toBeTruthy();
});

test('ref', () => {
    const world = new World().registerObject(TileClass);
    const node = world.create(TileClass);
    const ref = world.getRef(node);
    expect(ref()).toBe(node);
});

test('ref with id', () => {
    const world = new World().registerObject(TileClass);
    const node = world.create(TileClass, '123');
    const ref = world.getRef('123');
    expect(ref()).toBe(node);
});

test('create and check', () => {
    const world = new World().registerObject(TileClass);
    const tile = world.create(TileClass, '123');
    tile.position = {
        row: 1,
        col: 2,
    };
    expect(tile.check()).toBe(true);
});
