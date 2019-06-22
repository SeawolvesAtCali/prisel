import { State } from './objects';
import { PayloadType } from '@prisel/common';

type Handler = (data: PayloadType, messageType?: string) => State;

export type MessageFilter = (messageType: string, data: PayloadType) => boolean;

export type HandlerKey = string | MessageFilter;

function isMessageFilter(handlerKey: HandlerKey): handlerKey is MessageFilter {
    return typeof handlerKey === 'function';
}

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
        if (isMessageFilter(messageTypeOrFilter)) {
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
        const onceHandler = (data: PayloadType, messageType: string) => {
            handler(data, messageType);
            off();
        };

        const off = this.on(messageTypeOrFilter, onceHandler);
        return off;
    }

    public dispatch(messageType: string, data: PayloadType) {
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
