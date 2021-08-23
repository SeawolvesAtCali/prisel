import { priselpb } from '@prisel/protos';
import { isValidPacket, isValidRequest, isValidResponse, Packet } from '../packet';
import { Request } from '../request';
import { Response } from '../response';

describe('packet', () => {
    it('packing and unpacking actionPayload', () => {
        const unpackedPayload = Packet.getPayload(
            Packet.forAction('test')
                .withPayloadBuilder((builder) =>
                    priselpb.ChatPayload.createChatPayload(builder, builder.createString('hello')),
                )
                .build()[1],
            priselpb.ChatPayload.getRootAsChatPayload,
        );
        expect(unpackedPayload).not.toBeNull();
        expect(unpackedPayload?.message()).toBe('hello');
    });

    it('unpacking should not throw error', () => {
        expect(
            Packet.getPayload(
                Packet.forAction('test').build()[1],
                priselpb.ChatPayload.getRootAsChatPayload,
            ),
        ).toBeNull();

        // extracting with different payload type will not failed. But the
        // result will be unexpected.
        expect(
            Packet.getPayload(
                Packet.forAction('test')
                    .withPayloadBuilder((builder) =>
                        priselpb.ChatPayload.createChatPayload(
                            builder,
                            builder.createString('test'),
                        ),
                    )
                    .build()[1],
                priselpb.BroadcastPayload.getRootAsBroadcastPayload,
            ),
        ).toBeDefined();
    });

    it('systemAction payload', () => {
        const [, packet] = Request.forSystemAction(priselpb.SystemActionType.LOGIN)
            .withPayloadBuilder((builder) =>
                priselpb.LoginRequest.createLoginRequest(builder, builder.createString('name')),
            )
            .build();
        expect(Packet.hasPayload(packet)).toBe(true);
        expect(
            Packet.getPayload(packet, priselpb.LoginRequest.getRootAsLoginRequest)?.username(),
        ).toBe('name');
    });

    it('Packet.verify verifies packet', () => {
        const [, request] = Request.forSystemAction(priselpb.SystemActionType.LOGIN)
            .withPayloadBuilder((builder) =>
                priselpb.LoginRequest.createLoginRequest(builder, builder.createString('superman')),
            )
            .setId('2')
            .build();
        expect(isValidRequest(request)).toBe(true);
        expect(Packet.verify(request)).toBe(true);

        const [, response] = Response.forRequest(request)
            .withPayloadBuilder((builder) =>
                priselpb.LoginResponse.createLoginResponse(builder, builder.createString('123')),
            )
            .build();
        expect(isValidResponse(response)).toBe(true);
        expect(isValidPacket(response)).toBe(true);

        const [, packet] = Packet.forAction('message')
            .withPayloadBuilder((builder) =>
                priselpb.ChatPayload.createChatPayload(builder, builder.createString('something')),
            )
            .build();

        expect(isValidRequest(packet)).toBe(false);
        expect(isValidResponse(packet)).toBe(false);
        expect(Packet.verify(packet)).toBe(true);

        // not setting requestId, making it invalid Request
        const [, invalidRequest] = Request.forAction('test').build();
        expect(isValidPacket(invalidRequest)).toBe(true);
        expect(Packet.verify(invalidRequest)).toBe(false);
    });
});
