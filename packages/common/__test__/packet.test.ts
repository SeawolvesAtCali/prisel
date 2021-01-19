import { priselpb } from '@prisel/protos';
import { isValidRequest, isValidResponse, Packet } from '../packet';
import { Request } from '../request';
import { Response } from '../response';

describe('packet', () => {
    it('packing and unpacking actionPayload', () => {
        const packet = Packet.forAction('test')
            .setPayload(priselpb.ChatPayload, { message: 'hello' })
            .build();
        const unpackedPayload = Packet.getPayload(packet, priselpb.ChatPayload);
        expect(priselpb.ChatPayload.is(unpackedPayload)).toBe(true);
        expect(unpackedPayload).toEqual({ message: 'hello' });
    });
    it('unpacking should not throw error', () => {
        expect(
            Packet.getPayload(Packet.forAction('test').build(), priselpb.ChatPayload),
        ).toBeUndefined();
        expect(
            Packet.getPayload(
                Packet.forAction('test')
                    .setPayload(priselpb.ChatPayload, { message: 'hello' })
                    .build(),
                priselpb.BroadcastPayload,
            ),
        ).toBeUndefined();
    });
    it('systemAction payload should be read using oneof payload key', () => {
        const packet = Request.forSystemAction(priselpb.SystemActionType.LOGIN)
            .setPayload('loginRequest', {
                username: 'name',
            })
            .build();
        expect(Packet.hasPayload(packet, 'loginRequest')).toBe(true);
        expect(Packet.getPayload(packet, 'loginRequest')).toMatchObject<priselpb.LoginRequest>({
            username: 'name',
        });
        expect(Packet.hasPayload(packet, priselpb.LoginRequest)).toBe(false);
        expect(Packet.getPayload(packet, priselpb.LoginRequest)).toBeUndefined();
    });
    it('serialize and deserialize', () => {
        const request = Request.forSystemAction(priselpb.SystemActionType.LOGIN)
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
        const request = Request.forSystemAction(priselpb.SystemActionType.LOGIN)
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
            .setPayload(priselpb.ChatPayload, { message: 'something' })
            .build();
        expect(isValidRequest(packet)).toBe(false);
        expect(isValidResponse(packet)).toBe(false);
        expect(Packet.is(packet)).toBe(true);
    });
});
