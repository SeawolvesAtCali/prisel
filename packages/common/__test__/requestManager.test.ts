import { RequestManager, newRequestManager } from '../requestManager';
import { PacketType, Status, Response } from '../packet';

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
            status: Status.SUCCESS,
            request_id: '123',
        };
        manager.onResponse(response);
        const receivedResponse = await promise;
        expect(response).toBe(receivedResponse);
    });
});
