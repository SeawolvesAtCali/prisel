import { deserialize, serialize } from 'serializr';
import { Ref } from '../ref2';

describe('ref', () => {
    test('serialize', () => {
        const ref = Ref.forTest('123');
        expect(serialize(ref)).toMatchObject({
            id: '123',
        });
    });
    test('deserialize', () => {
        const ref = Ref.forTest('123');
        const deserialized = deserialize(Ref, serialize(ref));
        expect(deserialized).toBeInstanceOf(Ref);
        expect(deserialized.equals(ref)).toBe(true);
    });
});
