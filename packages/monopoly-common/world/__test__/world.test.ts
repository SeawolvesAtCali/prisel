import { TileClass } from '../PathNode';
import { World } from '../World';

test('id', () => {
    const world = new World().registerObject(TileClass);
    const node = world.create(TileClass);
    expect(node.id).toBeTruthy();
});

test('ref', () => {
    const world = new World().registerObject(TileClass);
    const node = world.create(TileClass);
    const ref = world.getRef(TileClass, node);
    expect(ref()).toBe(node);
});

test('ref with id', () => {
    const world = new World().registerObject(TileClass);
    const node = world.create(TileClass, '123');
    const ref = world.getRef(TileClass, '123');
    expect(ref()).toBe(node);
});
