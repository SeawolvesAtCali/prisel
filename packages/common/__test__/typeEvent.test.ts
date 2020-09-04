import { EventEmitter } from 'events';
import { createEvent } from '../typedEvent';

describe('typedEvent', () => {
    test('sub adds the callback', () => {
        const emitter = new EventEmitter();
        const typedEvent = createEvent('test', emitter);
        const callback = () => {};
        typedEvent.sub(callback);
        expect(emitter.listenerCount('test')).toBe(1);
        expect(emitter.listeners('test')).toEqual(expect.arrayContaining([callback]));
    });

    test('sub returns an unsub function', () => {
        const emitter = new EventEmitter();
        const typedEvent = createEvent('test', emitter);
        const callback = () => {};
        const unsub = typedEvent.sub(callback);
        unsub();
        expect(emitter.listenerCount('test')).toBe(0);
    });
});
