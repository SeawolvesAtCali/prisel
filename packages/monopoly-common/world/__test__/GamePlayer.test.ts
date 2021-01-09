import { GamePlayer } from '../GamePlayer';
import { Property } from '../Property';
import { Ref } from '../ref2';
import { Tile } from '../Tile';
import { World } from '../World';

describe('GamePlayer', () => {
    test('serialize', () => {
        const player = new GamePlayer();
        player.character = 1;
        player.id = '123';
        player.money = 100;
        player.owning = [Ref.forTest<Property>('property1'), Ref.forTest<Property>('property2')];
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
        world.registerObject(GamePlayer);
        const deserialized = GamePlayer.deserialize(player.serialize(), world);
        expect(deserialized).toBeInstanceOf(GamePlayer);
        expect(deserialized.id).toBe('123');
        expect(deserialized.money).toBe(100);
        expect(deserialized.owning).toHaveLength(2);
        expect(deserialized.owning[0].equals(Ref.forTest('property1'))).toBe(true);
        expect(deserialized.owning[1].equals(Ref.forTest('property2'))).toBe(true);
        expect(deserialized.pathTile.equals(Ref.forTest('tile1'))).toBe(true);
        expect(deserialized.rolled).toBe(true);
        expect(deserialized.world).toBe(world);
    });
});
