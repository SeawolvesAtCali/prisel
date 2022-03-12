import { Packet, Request, Response } from '@prisel/common';

export class PubSub {
    private subscription:
        | Map<any, Set<(packet: any, action?: any) => void>>
        | undefined = new Map();

    public isOpen() {
        return !!this.subscription;
    }

    public on<T, P extends Packet | Response | Request>(
        action: T,
        handler: (packet: P, action?: T) => void,
    ) {
        if (!this.subscription) {
            throw new Error('pubsub is already closed, cannot listen for more action');
        }
        const listenerSet = this.subscription.get(action) || new Set();
        listenerSet.add(handler);
        this.subscription.set(action, listenerSet);
        return () => {
            listenerSet.delete(handler);
        };
    }

    public getListeners(action: any) {
        if (!this.subscription) {
            throw new Error('pubsub is already closed, cannot getListeners');
        }
        return Array.from(this.subscription.get(action) || []);
    }

    public getAllListeners() {
        if (!this.subscription) {
            throw new Error('pubsub is already closed, cannot getAllListeners');
        }
        let allListeners: Array<(packet: Packet, action?: any) => void> = [];
        for (const subscriptions of this.subscription.values()) {
            allListeners = allListeners.concat(Array.from(subscriptions));
        }
        return allListeners;
    }

    public off<T>(action: T, handler?: (packet: Packet, action?: T) => void) {
        if (!this.subscription) {
            throw new Error('pubsub is already closed, cannot off listeners');
        }
        const subscriptions = this.subscription.get(action);
        if (!subscriptions) {
            return;
        }
        if (!handler) {
            this.subscription.delete(action);
            return;
        }
        if (subscriptions.has(handler)) {
            subscriptions.delete(handler);
        }
    }

    public dispatch(action: any, packet: Packet) {
        if (!this.subscription) {
            throw new Error('pubsub is already closed, cannot dispatch');
        }
        return new Promise<void>((resolve) => {
            // setImmediate is not standard in browser
            setTimeout(() => {
                if (this.subscription?.has(action)) {
                    const listeners = this.subscription.get(action);
                    if (!listeners) {
                        return;
                    }
                    for (const listener of listeners) {
                        // in case one of the listener close the pubSub
                        if (this.subscription && this.subscription.has(action)) {
                            listener(packet, action);
                        }
                    }
                }
                resolve();
            }, 0);
        });
    }

    public close() {
        this.subscription = undefined;
    }
}

export default PubSub;
