import { createIntialState } from '../state';
import { Handle } from '@prisel/server';
jest.mock('../genId', () => ({
    __esModule: true,
    default: () => 'gen_id',
}));

test('initial state', () => {
    const mockHandle = {
        emit: (playerId: string, data: object) => {
            expect(data).toMatchSnapshot();
            expect(JSON.stringify(data)).toMatchSnapshot();
        },
        log: (formatter: string, ...rest: any[]) => {},
    } as Handle;

    const game = createIntialState(['player1', 'player2'], mockHandle);
    game.processMessage(mockHandle, 'player1', { type: 'debug' });
});
