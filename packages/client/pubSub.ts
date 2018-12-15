import { State } from './objects';
import { AnyObject } from './client';

type Handler = (data: object, messageType?: string) => State;

export type MessageFilter = (messageType: string, data: AnyObject) => boolean;

export type HandlerKey = string | MessageFilter;
export default class PubSub {
    private subscription = new Map<HandlerKey, Set<Handler>>();
    private filters = new Set<MessageFilter>();

    public on(messageTypeOrFilter: HandlerKey, handler: Handler) {
        if (!this.subscription) {
            return;
        }
        const handlerSet = this.subscription.get(messageTypeOrFilter) || new Set();
        handlerSet.add(handler);
        this.subscription.set(messageTypeOrFilter, handlerSet);
        if (typeof messageTypeOrFilter === 'function') {
            this.filters.add(messageTypeOrFilter);
        }
        return () => {
            handlerSet.delete(handler);
        };
    }

    public once(messageTypeOrFilter: HandlerKey, handler: Handler) {
        if (!this.subscription) {
            return;
        }
        const onceHandler = (data: object, messageType: string) => {
            handler(data, messageType);
            off();
        };

        const off = this.on(messageTypeOrFilter, onceHandler);
        return off;
    }

    public dispatch(messageType: string, data: object) {
        if (!this.subscription) {
            return;
        }
        const keys = (Array.from(this.filters).filter((filter) =>
            filter(messageType, data),
        ) as HandlerKey[]).concat(messageType);
        keys.forEach((key) => {
            const handlerSet = this.subscription.get(key);
            if (handlerSet) {
                handlerSet.forEach((handler) => {
                    handler(data, messageType);
                });
            }
        });
    }

    public close() {
        this.subscription = undefined;
        this.filters = new Set<MessageFilter>();
    }
}
