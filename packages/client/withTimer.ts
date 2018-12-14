export default function withTimer<T>(promise: Promise<T>, timeInMilliseconds: number): Promise<T> {
    let timerId: any;

    return Promise.race([
        promise.then((result) => {
            clearTimeout(timerId);
            return result;
        }),
        new Promise<T>((_, reject) => {
            timerId = setTimeout(() => {
                reject(new Error(`timeout after ${timeInMilliseconds} ms`));
            }, timeInMilliseconds);
        }),
    ]);
}
