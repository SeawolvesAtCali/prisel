import { Packet } from '@prisel/common';
import { PubSub } from '../pubSub';

const mockPacket = Packet.forAction('TEST').build();

describe('pubSub', () => {
    let pubSub: PubSub;
    beforeEach(() => {
        pubSub = new PubSub();
    });
    test('on', () => {
        const handler = () => {};
        const off = pubSub.on('action', handler);
        expect(pubSub.getListeners('action')).toEqual(expect.arrayContaining([handler]));
        expect(pubSub.getAllListeners()).toEqual(expect.arrayContaining([handler]));

        off();

        expect(pubSub.getListeners('action')).not.toEqual(expect.arrayContaining([handler]));
        expect(pubSub.getAllListeners()).not.toEqual(expect.arrayContaining([handler]));
    });

    test('on multiple events', () => {
        pubSub.on('action', () => {});
        pubSub.on('action2', () => {});
        expect(pubSub.getAllListeners()).toHaveLength(2);
    });

    test('dispatch', async () => {
        const promise = new Promise((resolve) => {
            pubSub.on('action', resolve);
        });

        pubSub.dispatch('action', mockPacket);
        expect(await promise).toBe(mockPacket);
    });

    test('dispatch should call handlers in the order they are added', async () => {
        const order: number[] = [];
        pubSub.on('action', () => {
            order.push(1);
        });
        pubSub.on('action', () => {
            order.push(2);
        });
        pubSub.on('action', () => {
            order.push(3);
        });
        await pubSub.dispatch('action', mockPacket);
        expect(order).toMatchObject([1, 2, 3]);
    });

    test('dispatch should not trigger already removed listener', async () => {
        // test using the property that handlers are called in the order they
        // are added
        const handler1 = () => {
            pubSub.off('action', handler2);
        };
        const handler2 = () => {
            throw new Error('handler2 is called');
        };
        pubSub.on('action', handler1);
        pubSub.on('action', handler2);

        await pubSub.dispatch('action', mockPacket);
    });
    test('dispatch should not trigger already removed action', async () => {
        // test using the property that handlers are called in the order they
        // are added
        const handler1 = () => {
            pubSub.off('action');
        };
        const handler2 = () => {
            throw new Error('handler2 is called');
        };
        pubSub.on('action', handler1);
        pubSub.on('action', handler2);
        await pubSub.dispatch('action', mockPacket);
    });
    test('dispatch should stop triggering remaining handlers if pubSub is closed', async () => {
        // test using the property that handlers are called in the order they
        // are added
        const handler1 = () => {
            pubSub.close();
        };
        const handler2 = () => {
            throw new Error('handler2 is called');
        };
        pubSub.on('action', handler1);
        pubSub.on('action', handler2);
        await pubSub.dispatch('action', mockPacket);
    });
});
