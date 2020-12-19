import { packet_type, system_action_type } from '@prisel/protos';
import { Request } from '../request';
import { Response } from '../response';

describe('response', () => {
    it('isResponse works for response created using ResponseBuilder', () => {
        const request: Request = {
            type: packet_type.PacketType.REQUEST,
            requestId: '1',
            message: {
                $case: 'systemAction',
                systemAction: system_action_type.SystemActionType.LOGIN,
            },
            payload: {
                payload: {
                    $case: 'loginRequest',
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
