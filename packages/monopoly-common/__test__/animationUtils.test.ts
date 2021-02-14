import { Token } from '@prisel/common';
import { Anim } from '../animationUtils';

function flushAllImmediatePromise() {
    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}
test('timeoutPromise returns a promise', async () => {
    jest.useFakeTimers();
    const token = Token.get();
    const promise = Anim.wait(Anim.create('game_start').setLength(3000), { token });
    let resolved = false;
    promise.then(() => (resolved = true));
    expect(promise).toEqual(expect.any(Promise));
    jest.advanceTimersByTime(1000);
    expect(token.cancelled).toBe(false);
    jest.advanceTimersByTime(2000);
    jest.useRealTimers();
    await flushAllImmediatePromise();
    expect(token.cancelled).toBe(false); // passed in token should not be cancelled by Anim.
    expect(resolved).toBe(true);
});
test('timeoutPromise cancels timer', async () => {
    const token = Token.get();
    const promise = Anim.wait(Anim.create('game_start').setLength(3000), { token });
    let isStopped = false;
    promise.then(() => (isStopped = true));
    token.cancel();
    await flushAllImmediatePromise();
    expect(isStopped).toBe(true);
});
