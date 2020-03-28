import { createClients } from './testHelper';
import { Messages } from '@prisel/client';

describe('connect', () => {
    it('single client connect', async () => {
        const [client] = createClients();
        await client.connect();
        expect(client.isConnected).toBe(true);
        client.exit();
    });

    it('multiple client connect', async () => {
        const [client1, client2] = createClients(2);
        await client1.connect();
        expect(client1.isConnected).toBe(true);
        await client2.connect();
        expect(client2.isConnected).toBe(true);
        client1.exit();
        client2.exit();
    });

    it('login', async () => {
        const [client] = createClients();
        await client.connect();
        await client.request(Messages.getLogin(client.newId(), 'super'));
        client.exit();
    });
});
