import { startServer, runFunc } from '../automation/scriptRunner';
import * as constants from '../common/constants';
import { createClients } from './testHelper';
import { ChildProcess } from 'child_process';

describe('connect', () => {
    let server: ChildProcess;
    beforeEach(() => {
        server = startServer();
    });
    it('single client connect', async () => {
        const [client] = createClients();
        await runFunc(
            async () => {
                await client.connect();
                expect(client.isConnected).toBe(true);
            },
            {
                onExit: () => {
                    client.disconnect();
                    server.kill();
                },
            },
        );
    });

    it('multiple client connect', async () => {
        const [client1, client2] = createClients(2);

        await runFunc(
            async () => {
                await client1.connect();
                expect(client1.isConnected).toBe(true);
                await client2.connect();
                expect(client2.isConnected).toBe(true);
            },
            {
                onExit: () => {
                    client1.disconnect();
                    client2.disconnect();
                    server.kill();
                },
            },
        );
    });

    it('login', async () => {
        const [client] = createClients();

        await runFunc(
            async () => {
                await client.connect();
                client.login('super');
                await client.once(constants.CONTROLLER_NS, 'LOGIN_ACCEPT');
            },
            {
                onExit: () => {
                    client.disconnect();
                    server.kill();
                },
            },
        );
    });
});
