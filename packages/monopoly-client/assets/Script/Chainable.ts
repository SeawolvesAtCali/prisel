function isPromiseGenerator(val: (() => Promise<any>) | Promise<any>): val is () => Promise<any> {
    return typeof val === 'function';
}

/**
 * Chainable is a container for promise generator(function that generates a
 * promise). A new Chainable is active, and is able to chain promise generator.
 * The first chained promise generator will be called immediately. The returned
 * promise will be waited on. If a second promise generator is chained before
 * the first promise is fulfilled or rejected, the second promise generator will
 * be called when the first one is finished. Same goes for third and fourth
 * chain and so on.
 *
 * A chainable becames inactive when the last chained promise is finished. A
 * inactive chainable cannot chain promise generators anymore. The `then`
 * function of the chainable will be called.
 *
 * If any of the chained promise generator created a promise that rejects, the
 * chainable will become inactive immediately and the `catch` function of the
 * chainable will be called.
 *
 * A keepActive token (a promise) can be passed when creating the
 * Chainable.Chainable will not become inactive when the token is not finished.
 *
 * If no promise generator is chain, the Chainable remain active.
 */
export class Chainable implements Promise<any> {
    private isActive = true;
    private queue: Array<() => Promise<any>> = [];
    private debugQueue: string[] = [];
    private keepActive = false;
    private promise: Promise<any>;
    private hasChained = false;
    private resolve: () => void;
    private reject: (error: any) => void;

    get active() {
        return this.isActive;
    }

    private constructor(activeToken?: Promise<any>) {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            if (activeToken) {
                activeToken
                    .then(
                        () => {
                            if (this.queue.length === 0 && this.hasChained) {
                                resolve();
                            }
                        },
                        (reason) => {
                            reject(reason);
                        },
                    )
                    .finally(() => {
                        this.keepActive = false;
                    });
                this.keepActive = true;
            }
        });
    }

    private async runQueue() {
        while (this.queue.length > 0) {
            await this.queue[0]();
            this.queue.shift();
            if (this.debugQueue[0]) {
                cc.log(`${this.debugQueue[0]} finished, queue length ${this.queue.length}`);
            }
            this.debugQueue.shift();
        }
    }

    /**
     * Create a Chainable.
     */
    public static create(): Chainable {
        return new Chainable();
    }

    public static activeWhen(token: Promise<any>): Chainable {
        return new Chainable(token);
    }

    public chain(promiseGenerator: (() => Promise<any>) | Promise<any>, debug?: string): Chainable {
        if (this.isActive) {
            this.queue.push(
                isPromiseGenerator(promiseGenerator) ? promiseGenerator : () => promiseGenerator,
            );
            this.debugQueue.push(debug);
            this.hasChained = true;
            if (this.queue.length === 1) {
                this.runQueue().then(
                    () => {
                        if (!this.keepActive) {
                            this.isActive = false;
                            this.resolve();
                        }
                    },
                    (reason) => {
                        this.reject(reason);
                    },
                );
            }
        }
        return this;
    }

    public chainOrRun(
        promiseGenerator: (() => Promise<any>) | Promise<any>,
        runable: () => void,
        debug?: string,
    ): Chainable {
        if (this.isActive) {
            return this.chain(promiseGenerator, debug);
        }
        if (debug) {
            cc.log(`chain not active, run ${debug} right now`);
        }
        runable();
        return this;
    }

    public then(
        onfulfilled?: ((value: any) => any | PromiseLike<any>) | undefined | null,
        onrejected?: ((reason: any) => any | PromiseLike<any>) | undefined | null,
    ): Promise<any> {
        return this.promise.then(onfulfilled, onrejected);
    }

    public catch(
        onrejected?: ((reason: any) => any | PromiseLike<any>) | undefined | null,
    ): Promise<any> {
        return this.promise.catch(onrejected);
    }

    public finally(onfinally?: () => void): Promise<any> {
        return this.promise.finally(onfinally);
    }

    public get [Symbol.toStringTag]() {
        return 'Chainable';
    }
}
