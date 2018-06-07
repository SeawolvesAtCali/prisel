const { isRoom } = require('../room');

describe('room', () => {
    describe('isRoom', () => {
        it('success', () => {
            expect(
                isRoom({
                    id: 'room1',
                    name: 'hotel',
                    users: {},
                }).length,
            ).toBe(0);
        });
    });
});
