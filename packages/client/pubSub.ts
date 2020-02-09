import { State } from './objects';
import { Packet } from '@prisel/common';

export type Listener<T = any, Payload = any> = (packet: Packet<Payload>, action?: T) => State;

export type Filter<T = any> = (packet: Packet, action?: T) => boolean;

export default class PubSub {
    private subscription = new Map<any, Set<Listener>>();

    public on<T>(action: T, handler: Listener) {
        if (!this.subscription) {
            return;
        }
        const listenerSet = this.subscription.get(action) || new Set();
        listenerSet.add(handler);
        this.subscription.set(action, listenerSet);
        return () => {
            listenerSet.delete(handler);
        };
    }

    public dispatch(action: any, packet: Packet) {
        if (!this.subscription) {
            return;
        }

        if (this.subscription.has(action)) {
            for (const listener of this.subscription.get(action)) {
                listener(packet, action);
            }
        }
    }

    public close() {
        this.subscription = undefined;
    }
}
