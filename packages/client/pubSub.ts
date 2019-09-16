import { State } from './objects';
import { Payload } from '@prisel/common';
import { MessageType } from '@prisel/common';

type Handler = (data: Payload, messageType?: MessageType) => State;

export type MessageFilter = (messageType: MessageType, data: Payload) => boolean;

export type HandlerKey = MessageType | MessageFilter;

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
        const onceHandler = (data: Payload, messageType: MessageType) => {
            handler(data, messageType);
            off();
        };

        const off = this.on(messageTypeOrFilter, onceHandler);
        return off;
    }

    public dispatch(messageType: MessageType, data: Payload) {
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
