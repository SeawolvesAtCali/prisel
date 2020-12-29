import { packet_type, status } from '@prisel/protos';
import { Packet } from '../packet';
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
        const promise = manager.addRequest(
            { type: packet_type.PacketType.REQUEST, requestId: '123' },
            10,
        );
        const response: Response = {
            type: packet_type.PacketType.RESPONSE,
            status: {
                code: status.Status_Code.OK,
            },
            requestId: '123',
        };
        manager.onResponse(response);
        const receivedResponse = await promise;
        expect(Packet.isStatusOk(receivedResponse)).toBe(true);
        expect(receivedResponse.type).toBe(packet_type.PacketType.RESPONSE);
        expect(receivedResponse.requestId).toBe('123');
    });
});
