const noop = () => {};

/**
 * Token can be passed to async functions to represent the state of parent
 * context. When token is not cancelled, that means parent context is still
 * valid. Token should be cancelled *BY THE CONTEXT THAT OWNS IT*. This means
 * if an token is passed to a child context, do not cancel it unless the
 * function name specifically mention that it will do it on behave of the parent
 * context.
 */
export class Token {
    private cancelled_ = false;

    private resolveFunc: (reason: string) => void = noop;
    public readonly promise: Promise<string>;

    /**
     * Create a token
     */
    public static get() {
        return new Token();
    }

    /**
     * Create a Token that cancels after the given milliseconds.
     * @param timeoutInMs
     */
    public static delay(timeoutInMs: number) {
        const token = new Token();
        setTimeout(() => {
            token.cancel(`timeout after ${timeoutInMs} ms`);
        }, timeoutInMs);
        return token;
    }

    private constructor() {
        this.promise = new Promise<string>((resolve) => {
            this.resolveFunc = resolve;
        });
    }
    public get cancelled() {
        return this.cancelled_;
    }

    /** discard the token without calling cancellation callbacks (promise won't
     * be resolved) */
    public discard() {
        this.cancelled_ = true;
    }

    /** Cancel the token and notify all the subscribers through promise */
    public cancel(reason: string = 'cancelled') {
        if (!this.cancelled_) {
            this.cancelled_ = true;
            this.resolveFunc(reason);
        }
    }
}
