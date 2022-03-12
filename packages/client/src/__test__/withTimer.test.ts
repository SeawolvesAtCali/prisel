import withTimer from '../withTimer';

beforeEach(() => {
    jest.useFakeTimers();
});
afterEach(() => {
    jest.useRealTimers();
});
test('if promise returns immediately, should resolve to what promise resolves', async () => {
    const resolvedValue = {};
    const result = await withTimer(Promise.resolve(resolvedValue), 5000);
    expect(result).toBe(resolvedValue);
});

test('if promise returns earlier, should resolve to what promise resolves', async () => {
    const resolvedValue = {};

    const resultPromise = withTimer(
        new Promise((resolve) => {
            setTimeout(resolve, 5000, resolvedValue);
        }),
        10000,
    );
    jest.advanceTimersByTime(6000);
    const result = await resultPromise;
    expect(result).toBe(resolvedValue);
});

test('if resolved after timeout, should reject', async () => {
    expect.assertions(1);
    const resolvedValue = {};
    const promise = new Promise((resolve) => {
        setTimeout(resolve, 10000, resolvedValue);
    });
    const withTimerPromise = withTimer(promise, 5000);
    jest.advanceTimersByTime(6000);
    await expect(withTimerPromise).rejects.toThrowError('timeout after 5000 ms');
});

test('if promise rejects before timeout, should reject', async () => {
    const promise = Promise.reject('error');
    await expect(withTimer(promise, 5000)).rejects.toEqual('error');
});

test('if promise rejects after timeout, should reject with timeout error', async () => {
    const promise = new Promise((resolve, reject) => {
        setTimeout(reject, 10000, 'error');
    });
    const withTimerPromise = withTimer(promise, 5000);
    jest.advanceTimersByTime(6000);
    await expect(withTimerPromise).rejects.toThrowError('timeout after 5000 ms');
});
