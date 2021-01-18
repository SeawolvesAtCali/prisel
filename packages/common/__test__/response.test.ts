import { priselpb } from '@prisel/protos';
import { Request } from '../request';
import { Response } from '../response';

describe('response', () => {
    it('isResponse works for response created using ResponseBuilder', () => {
        const request: Request = {
            type: priselpb.PacketType.REQUEST,
            requestId: '1',
            message: {
                oneofKind: 'systemAction',
                systemAction: priselpb.SystemActionType.LOGIN,
            },
            payload: {
                payload: {
                    oneofKind: 'loginRequest',
                    loginRequest: {
                        username: 'batman',
                    },
                },
            },
        };
        const response = Response.forRequest(request)
            .setPayload('loginResponse', {
                userId: '123',
            })
            .build();
        expect(Response.isResponse(response)).toBe(true);
    });
});
