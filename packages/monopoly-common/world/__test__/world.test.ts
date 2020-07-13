import { PathNode } from '../PathNode';
import { World } from '../World';

test('id', () => {
    const world = new World().registerObject(PathNode);
    const node = world.create(PathNode);
    expect(node.id).toBeTruthy();
});

test('ref', () => {
    const world = new World().registerObject(PathNode);
    const node = world.create(PathNode);
    const ref = world.getRef(PathNode, node);
    expect(ref()).toBe(node);
});

test('ref with id', () => {
    const world = new World().registerObject(PathNode);
    const node = world.create(PathNode, '123');
    const ref = world.getRef(PathNode, '123');
    expect(ref()).toBe(node);
});
