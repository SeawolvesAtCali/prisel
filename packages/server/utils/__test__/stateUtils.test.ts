import { mockContext } from '../testUtils';
import { addRoom } from '../stateUtils';

describe('stateUtils', () => {
    describe('addRoom', () => {
        test('game state is an empty object initially', () => {
            const context = mockContext();
            const room = addRoom(context, 'room name');
            expect(room.gameState).toBeDefined();
            expect(room.gameState).toMatchObject({});
        });
    });
});
