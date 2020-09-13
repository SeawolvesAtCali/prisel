import { createEvent, TypedEvent } from '@prisel/common';
import { renderHook } from '@testing-library/react-hooks';
import { EventEmitter } from 'events';
import { useTypedEvent } from '../useTypedEvent';

describe('useTypedEvent', () => {
    test('should sub to event', () => {
        const emitter = new EventEmitter();
        const event = createEvent('test', emitter);
        const callback = () => {};
        renderHook(() => useTypedEvent(event, callback));
        expect(emitter.listenerCount('test')).toBe(1);
        expect(emitter.listeners('test')).toEqual(expect.arrayContaining([callback]));
    });

    test('should unsub event when callback changed', () => {
        const emitter = new EventEmitter();
        const ev = createEvent('test', emitter);
        const callback = () => {};
        const { rerender } = renderHook(
            ({ event, callback }: { event: TypedEvent; callback: () => void }) =>
                useTypedEvent(event, callback),
            {
                initialProps: {
                    event: ev,
                    callback,
                },
            },
        );

        rerender({ event: ev, callback: () => {} });

        expect(emitter.listenerCount('test')).toBe(1);
        expect(emitter.listeners('test')).not.toEqual(expect.arrayContaining([callback]));
    });

    test('should not sub when callback unchange', () => {
        const emitter = new EventEmitter();
        const ev = createEvent('test', emitter);
        const callback = () => {};
        const { rerender } = renderHook(
            ({ event, callback }: { event: TypedEvent; callback: () => void }) =>
                useTypedEvent(event, callback),
            {
                initialProps: {
                    event: ev,
                    callback,
                },
            },
        );

        rerender({ event: ev, callback });

        expect(emitter.listenerCount('test')).toBe(1);
        expect(emitter.listeners('test')).toEqual(expect.arrayContaining([callback]));
    });
});
