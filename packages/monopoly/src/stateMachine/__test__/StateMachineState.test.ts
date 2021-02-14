import { Token } from '@prisel/server';
import Game from '../../Game';
import { StateMachine } from '../StateMachine';
import { StateMachineState } from '../StateMachineState';

class TestState extends StateMachineState {
    constructor(game: Game, stateMachine: StateMachine, token: Token) {
        super(game, stateMachine);
        this.token = token; // replace the state token with the given token. This should only be done for test, because this state manages this token and it might cancel it.
    }
    public get [Symbol.toStringTag](): string {
        return 'TestState';
    }
    public testCoroutine(generator: Generator<Promise<any>>): Promise<void> {
        return this.startCoroutine(generator);
    }
}

describe('StateMachineState', () => {
    test('startCoroutine', async () => {
        const result: number[] = [];
        function* generator() {
            for (let i = 0; i < 10; i++) {
                yield Promise.resolve(i).then((num) => result.push(num));
            }
        }
        const game = new Game();
        const token = Token.get();
        const state = new TestState(game, new StateMachine(game), token);
        await state.testCoroutine(generator());
        expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    test('startCoroutine with non-void promises', async () => {
        const result: number[] = [];
        function* generator() {
            for (let i = 0; i < 10; i++) {
                result.push(yield Promise.resolve(i));
            }
        }
        const game = new Game();
        const token = Token.get();
        const state = new TestState(game, new StateMachine(game), token);
        await state.testCoroutine(generator());
        expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    test('cancel coroutine', async () => {
        const result: number[] = [];

        const token = Token.get();
        function* generator() {
            for (let i = 0; i < 10; i++) {
                if (i === 4) {
                    token.cancel();
                }
                yield Promise.resolve().then(() => result.push(i)); // this promise is not cancellable, so even when token is cancelled, it will still execute. This is why 4 is added to the list.
            }
        }
        const game = new Game();
        const state = new TestState(game, new StateMachine(game), token);

        await state.testCoroutine(generator());
        expect(result).toEqual([0, 1, 2, 3, 4]);
    });
});
