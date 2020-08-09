import { TileClass } from '../Tile2';
import { World } from '../World';

test('serialize', () => {
    const world = new World().registerObject(TileClass);
    const pathNode = world.create(TileClass);
    pathNode.path = {
        prev: [world.createRef(TileClass)],
        next: [world.createRef(TileClass)],
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
    const world = new World().registerObject(TileClass);
    const pathNode = world.create(TileClass);
    expect(pathNode.serialize()).toMatchObject({
        id: expect.any(String),
        type: 'tile',
    });
});
