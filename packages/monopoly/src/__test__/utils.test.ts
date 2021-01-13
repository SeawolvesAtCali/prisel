import { getRand } from '../utils';

describe('utils', () => {
    test('getRand returns undefined if list empty', () => {
        expect(getRand([])).toBeUndefined();
    });
    test('getRand returns an item', () => {
        const list = [1, 2, 3];
        const chosen = getRand(list);
        expect(chosen).toBeDefined();
        if (chosen) {
            expect(list.indexOf(chosen)).toBeGreaterThan(-1);
        }
    });
});
