import { monopolypb } from '@prisel/protos';
import { GamePlayer } from '../GamePlayer';
import { Property } from '../Property';
import { Ref } from '../ref2';
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

describe('GamePlayer', () => {
    test('serialize', () => {
        const player = new GamePlayer();
        player.character = 1;
        player.id = '123';
        player.money = 100;
        player.owning = [Ref.forTest<Property>('property1'), Ref.forTest<Property>('property2')];
        player.addCollectible({
            display: {
                title: 'get out of jail free',
                description: 'activate when entering jail',
            },
            type: 'collectible',
            inputArgs: {
                type: monopolypb.CollectibleExtra_CollectibleType.GET_OUT_OF_JAIL_FREE,
            },
        });
        player.pathTile = Ref.forTest<Tile>('tile1');
        player.rolled = true;
        expect(player.serialize()).toMatchSnapshot();
    });

    test('deserialize', () => {
        const player = new GamePlayer();
        player.character = 1;
        player.id = '123';
        player.money = 100;
        player.owning = [Ref.forTest<Property>('property1'), Ref.forTest<Property>('property2')];
        player.pathTile = Ref.forTest<Tile>('tile1');
        player.rolled = true;
        const world = new World();
        const deserialized = GamePlayer.deserialize(player.serialize(), world);
        expect(deserialized).toBeInstanceOf(GamePlayer);
        expect(deserialized.id).toBe('123');
        expect(deserialized.money).toBe(100);
        expect(deserialized.owning).toHaveLength(2);
        expect(deserialized.owning[0].equals(Ref.forTest('property1'))).toBe(true);
        expect(deserialized.owning[1].equals(Ref.forTest('property2'))).toBe(true);
        expect(deserialized.pathTile?.equals(Ref.forTest('tile1'))).toBe(true);
        expect(deserialized.rolled).toBe(true);
        expect(deserialized.world).toBe(world);
    });
});
