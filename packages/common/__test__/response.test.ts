import { priselpb } from '@prisel/protos';
import { Packet } from '../packet';
import { Request } from '../request';
import { Response } from '../response';

describe('response', () => {
    it('verify works for response created using ResponseBuilder', () => {
        const [, request] = Request.forSystemAction(priselpb.SystemActionType.LOGIN)
            .setId('1')
            .withPayloadBuilder((builder) =>
                priselpb.LoginRequest.createLoginRequest(builder, builder.createString('batman')),
            )
            .build();

        const [, response] = Response.forRequest(request)
            .withPayloadBuilder((builder) =>
                priselpb.LoginResponse.createLoginResponse(builder, builder.createString('123')),
            )
            .build();

        expect(Response.verify(response)).toBe(true);
        expect(response.requestId()).toBe('1');
        expect(Packet.isStatusOk(response));
    });
});
