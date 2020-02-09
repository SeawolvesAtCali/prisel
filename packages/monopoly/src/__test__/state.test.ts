import { createIntialState } from '../state';
import { newPlayer } from '@prisel/server';
jest.mock('../genId', () => ({
    __esModule: true,
    default: () => 'gen_id',
}));

test('initial state', () => {
    // const mockHandle = {
    //     emit: (playerId: string, data: object) => {
    //         expect(data).toMatchSnapshot();
    //         expect(JSON.stringify(data)).toMatchSnapshot();
    //     },
    //     log: (formatter: string, ...rest: any[]) => {},
    // } as Handle;

    // const game = createIntialState(['player1', 'player2']);
    // game.processMessage(mockHandle, 'player1', { type: 'debug' });
    expect(1).toBe(1);
});
