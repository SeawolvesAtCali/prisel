import { Anim } from '../animationUtils';

test('timeoutPromise returns a promise', async () => {
    jest.useFakeTimers();
    const { promise } = Anim.wait(Anim.create('game_start').setLength(3000));
    let isStopped = false;
    promise.then(() => (isStopped = true));
    await 0; // if promise is already resolved, `then` will run. wait a microtask to make sure `then` is not run.
    expect(isStopped).toBe(false);
    jest.runAllTimers();
    await 0; // wait a microtask to make sure `then` is run.
    expect(isStopped).toBe(true);
    jest.useRealTimers();
});
test('timeoutPromise cancels timer', async () => {
    const { promise, cancel } = Anim.wait(Anim.create('game_start').setLength(3000));
    let isStopped = false;
    promise.then(() => (isStopped = true));
    cancel();
    await 0; // wait a microtask to make sure `then` is run.
    expect(isStopped).toBe(true);
});
