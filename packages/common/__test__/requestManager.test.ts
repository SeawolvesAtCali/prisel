import { priselpb } from '@prisel/protos';
import { Packet } from '../packet';
import { Request } from '../request';
import { newRequestManager, RequestManager } from '../requestManager';
import { Response } from '../response';

describe('requestManager', () => {
    let manager: RequestManager;
    beforeEach(() => {
        manager = newRequestManager();
    });

    test('creation', () => {
        expect(manager).toBeDefined();
    });

    test('addRequest', async () => {
        const request = Request.forAction('message').setId('123').build();
        const promise = manager.addRequest(request, 10);
        const response = Response.forRequest(request).build();
        manager.onResponse(response);
        const receivedResponse = await promise;
        expect(Packet.isStatusOk(receivedResponse)).toBe(true);
        expect(receivedResponse.type).toBe(priselpb.PacketType.RESPONSE);
        expect(receivedResponse.requestId).toBe('123');
    });
});
