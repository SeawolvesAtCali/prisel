import { Messages, Packet } from '@prisel/client';
import { createClients } from './testHelper';

describe('create room', () => {
    it('join default room', async () => {
        const [client] = createClients();
        await client.connect();
        await client.request(Messages.getLogin(client.newId(), 'batman'));
        const response = await client.request(Messages.getJoin(client.newId()));
        expect(Packet.isStatusOk(response));
        expect(Packet.getPayload(response, 'joinResponse')?.room?.name).toEqual('room');
        client.exit();
    });

    it('create a room, join and then leave', async () => {
        const [client] = createClients();
        await client.connect();
        await client.request(Messages.getLogin(client.newId(), 'batman'));
        await client.request(Messages.getJoin(client.newId()));
        const leaveResponse = await client.request(Messages.getLeave(client.newId()));
        expect(Packet.isStatusOk(leaveResponse)).toBe(true);
        client.exit();
    });
});
