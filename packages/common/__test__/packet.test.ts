import { broadcast_spec, chat_spec, login_spec, system_action_type } from '@prisel/protos';
import { isValidRequest, isValidResponse, Packet } from '../packet';
import { Request } from '../request';
import { Response } from '../response';

describe('packet', () => {
    it('packing and unpacking actionPayload', () => {
        const packet = Packet.forAction('test')
            .setPayload(chat_spec.ChatPayload, { message: 'hello' })
            .build();
        const unpackedPayload = Packet.getPayload(packet, chat_spec.ChatPayload);
        expect(chat_spec.ChatPayload.is(unpackedPayload)).toBe(true);
        expect(unpackedPayload).toEqual({ message: 'hello' });
    });
    it('unpacking should not throw error', () => {
        expect(
            Packet.getPayload(Packet.forAction('test').build(), chat_spec.ChatPayload),
        ).toBeUndefined();
        expect(
            Packet.getPayload(
                Packet.forAction('test')
                    .setPayload(chat_spec.ChatPayload, { message: 'hello' })
                    .build(),
                broadcast_spec.BroadcastPayload,
            ),
        ).toBeUndefined();
    });
    it('systemAction payload should be read using oneof payload key', () => {
        const packet = Request.forSystemAction(system_action_type.SystemActionType.LOGIN)
            .setPayload('loginRequest', {
                username: 'name',
            })
            .build();
        expect(Packet.hasPayload(packet, 'loginRequest')).toBe(true);
        expect(Packet.getPayload(packet, 'loginRequest')).toMatchObject<login_spec.LoginRequest>({
            username: 'name',
        });
        expect(Packet.hasPayload(packet, login_spec.LoginRequest)).toBe(false);
        expect(Packet.getPayload(packet, login_spec.LoginRequest)).toBeUndefined();
    });
    it('serialize and deserialize', () => {
        const request = Request.forSystemAction(system_action_type.SystemActionType.LOGIN)
            .setPayload('loginRequest', { username: 'name' })
            .setId('2')
            .build();
        const serialized = Packet.serialize(request);
        const deserialized = Packet.deserialize(serialized);
        expect(deserialized).toBeDefined();
        if (deserialized) {
            expect(request).toMatchObject(deserialized);
        }
    });
    it('Packet.is verifies packet', () => {
        const request = Request.forSystemAction(system_action_type.SystemActionType.LOGIN)
            .setPayload('loginRequest', { username: 'superman' })
            .setId('2')
            .build();
        expect(isValidRequest(request)).toBe(true);
        expect(Packet.is(request)).toBe(true);

        const response = Response.forRequest(request)
            .setPayload('loginResponse', {
                userId: '123',
            })
            .build();
        expect(isValidResponse(response)).toBe(true);
        expect(Packet.is(response)).toBe(true);

        const packet = Packet.forAction('message')
            .setPayload(chat_spec.ChatPayload, { message: 'something' })
            .build();
        expect(isValidRequest(packet)).toBe(false);
        expect(isValidResponse(packet)).toBe(false);
        expect(Packet.is(packet)).toBe(true);
    });
});
