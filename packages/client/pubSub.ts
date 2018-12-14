import { State } from './objects';

type Handler = (data: object) => State;

export default class PubSub {
    private subscription = new Map<string, Set<Handler>>();

    public on(messageType: string, handler: Handler) {
        if (!this.subscription) {
            return;
        }
        const handlerSet = this.subscription.get(messageType) || new Set();
        handlerSet.add(handler);
        this.subscription.set(messageType, handlerSet);
        return () => {
            handlerSet.delete(handler);
        };
    }

    public once(messageType: string, handler: Handler) {
        if (!this.subscription) {
            return;
        }
        const onceHandler = (data: object) => {
            handler(data);
            off();
        };

        const off = this.on(messageType, onceHandler);
        return off;
    }

    public onceWhen(messageType: string, handler: Handler, predicate: (data: object) => boolean) {
        if (!this.subscription) {
            return;
        }
        const onceHandler = (data: object) => {
            if (predicate(data)) {
                handler(data);
                off();
            }
        };

        const off = this.on(messageType, onceHandler);
        return off;
    }

    public dispatch(messageType: string, data: object) {
        if (!this.subscription) {
            return;
        }
        const handlerSet = this.subscription.get(messageType);
        if (handlerSet) {
            handlerSet.forEach((handler) => {
                handler(data);
            });
        }
    }

    public close() {
        this.subscription = undefined;
    }
}
