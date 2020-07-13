import { PathNode } from '../PathNode';
import { World } from '../World';

test('serialize', () => {
    const world = new World().registerObject(PathNode);
    const pathNode = world.create(PathNode);
    pathNode.path = {
        prev: [world.createRef(PathNode)],
        next: [world.createRef(PathNode)],
    };
    expect(pathNode.serialize()).toMatchObject({
        id: expect.any(String),
        type: 'tile',
        path: {
            next: [expect.any(String)],
            prev: [expect.any(String)],
        },
    });
});

test('serialize no mixin', () => {
    const world = new World().registerObject(PathNode);
    const pathNode = world.create(PathNode);
    expect(pathNode.serialize()).toMatchObject({
        id: expect.any(String),
        type: 'tile',
    });
});
