import { TileClass } from '../Tile2';
import { World } from '../World';

test('serialize', () => {
    const world = new World().registerObject(TileClass);
    const tile = world.create(TileClass);
    tile.path = {
        prev: [world.createRef(TileClass)],
        next: [world.createRef(TileClass)],
    };
    expect(tile.serialize()).toMatchObject({
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
    const tile = world.create(TileClass);
    expect(tile.serialize()).toMatchObject({
        id: expect.any(String),
        type: 'tile',
    });
});
