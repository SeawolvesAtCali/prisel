import { listGameObjectSerizable } from '../serializeUtil';
import { Tile } from '../Tile';
import { World } from '../World';

let nextId = 0;
jest.mock('../../genId', () => {
    return {
        genId: () => `mocked_id_${nextId++}`,
    };
});
beforeEach(() => {
    nextId = 0;
    // prevent the order of test affect the mocked uuid
});
class TileWorld extends World {
    @listGameObjectSerizable(Tile)
    tiles: Tile[] = [];

    populateSerializedFields() {
        this.tiles = this.getAll(Tile);
    }

    clearSerializedFields() {
        this.tiles = [];
    }
}

test('serialize', () => {
    const world = new TileWorld();
    const tile = world.create(Tile);
    tile.prev = [world.createRef(Tile)];
    tile.next = [world.createRef(Tile)];

    expect(tile.serialize()).toMatchObject({
        id: expect.any(String),
        next: [expect.any(String)],
        prev: [expect.any(String)],
    });

    expect(world.serialize()).toMatchSnapshot();
    expect(world.tiles).toHaveLength(0);
});

test('deserialize', () => {
    const world = new TileWorld();
    const tile = world.create(Tile);
    tile.prev = [world.createRef(Tile)];
    tile.next = [world.createRef(Tile)];

    const serialized = world.serialize();

    const anotherWorld = new TileWorld();
    anotherWorld.populate(serialized);
    expect(anotherWorld.get<Tile>(tile.id)?.next[0].id).toBe(tile.next[0].id);
    expect(anotherWorld.tiles).toHaveLength(0);
    expect(anotherWorld.serialize()).toMatchSnapshot();
});
