import { Tile } from '../Tile';
import { World } from '../World';

test('serialize', () => {
    const world = new World().registerObject(Tile);
    const tile = world.create(Tile);
    tile.prev = [world.createRef(Tile)];
    tile.next = [world.createRef(Tile)];

    expect(tile.serialize()).toMatchObject({
        id: expect.any(String),
        type: 'tile',
        data: {
            next: [expect.any(String)],
            prev: [expect.any(String)],
        },
    });
});
