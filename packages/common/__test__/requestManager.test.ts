import { priselpb } from '@prisel/protos';
import { Token } from '../cancellationToken';
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
        const promise = manager.addRequest(request);
        const response = Response.forRequest(request).build();
        manager.onResponse(response);
        const receivedResponse = await promise;
        expect(Packet.isStatusOk(receivedResponse)).toBe(true);
        expect(receivedResponse.type).toBe(priselpb.PacketType.RESPONSE);
        expect(receivedResponse.requestId).toBe('123');
    });

    test('addRequest timeout', async () => {
        jest.useFakeTimers();
        const request = Request.forAction('message').setId('123').build();
        const token = Token.delay(10);
        const promise = manager.addRequest(request, token);
        jest.advanceTimersByTime(10);
        expect(token.cancelled).toBe(true);
        const response = Response.forRequest(request).build();
        manager.onResponse(response);
        jest.useRealTimers();
        return expect(promise).rejects.toMatchObject({ message: expect.any(String) });
    });
});
