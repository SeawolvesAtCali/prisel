import { checkWin, isEven } from '../gameConfig';

describe('@prisel/template', () => {
    describe('checkWin', () => {
        it('should win if line up horizontally', () => {
            expect(checkWin({ map: ['', '', '', 'x', 'x', 'x', '', '', ''] })).toBe(true);
        });
        it('should win if line up vertically', () => {
            expect(checkWin({ map: ['', '', 'o', '', '', 'o', '', '', 'o'] })).toBe(true);
        });

        it('should win if line up diagnally', () => {
            expect(checkWin({ map: ['', '', 'o', '', 'o', '', 'o', '', ''] })).toBe(true);
            expect(checkWin({ map: ['x', '', '', '', 'x', '', '', '', 'x'] })).toBe(true);
        });
    });
    describe('isEven', () => {
        it('should return even', () => {
            expect(isEven(['x', 'o', 'x', 'o', 'x', 'o', 'o', 'x', 'o'])).toBe(true);
        });
    });
});
