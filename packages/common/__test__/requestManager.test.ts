import { RequestManager, newRequestManager } from '../requestManager';
import { PacketType, Response } from '../packet';
import { Code } from '../code';

describe('requestManager', () => {
    let manager: RequestManager;
    beforeEach(() => {
        manager = newRequestManager();
    });

    test('creation', () => {
        expect(manager).toBeDefined();
    });

    test('addRequest', async () => {
        const promise = manager.addRequest({ type: PacketType.REQUEST, request_id: '123' }, 10);
        const response: Response = {
            type: PacketType.RESPONSE,
            status: {
                code: Code.OK,
            },
            request_id: '123',
        };
        manager.onResponse(response);
        const receivedResponse = await promise;
        expect(receivedResponse.ok()).toBe(true);
        expect(receivedResponse.type).toBe(PacketType.RESPONSE);
        expect(receivedResponse.request_id).toBe('123');
    });
});
