const debug = require('debug')('debug');
const { startServer, runFunc } = require('../automation/scriptRunner');
const constants = require('../common/constants');
const { createClients } = require('./testHelper');
const roomMessages = require('../client/message/room');

const { CONTROLLER_NS } = constants;

jest.setTimeout(30000);
describe('create room', () => {
    let server;
    beforeEach(() => {
        server = startServer();
    });
    it('create a room', async () => {
        const [client] = createClients();
        await runFunc(
            async () => {
                await client.connect();
                client.login('batman');
                await client.once(CONTROLLER_NS, 'LOGIN_ACCEPT');
                client.emit(CONTROLLER_NS, ...roomMessages.getCreateRoom('party room'));
                const { data } = await client.once(CONTROLLER_NS, 'CREATE_ROOM_ACCEPT');
                expect(typeof data.roomId).toBe('string');
            },
            {
                onExit: () => {
                    client.disconnect();
                    server.kill();
                },
            },
        );
    });

    it('create a room and a client join', async () => {
        const [host, client] = createClients(2);
        await runFunc(
            async () => {
                await host.connect();
                host.login('host');
                const { data: hostData } = await host.once(CONTROLLER_NS, 'LOGIN_ACCEPT');
                const hostId = hostData.userId;
                await client.connect();
                client.login('client');
                const { data: clientData } = await client.once(CONTROLLER_NS, 'LOGIN_ACCEPT');
                const clientId = clientData.userId;
                host.emit(CONTROLLER_NS, ...roomMessages.getCreateRoom('party room'));
                const { data: roomData } = await host.once(CONTROLLER_NS, 'CREATE_ROOM_ACCEPT');
                const { roomId } = roomData;
                client.emit(CONTROLLER_NS, ...roomMessages.getJoin(roomId));
                const [, hostRoomUpdateResult, clientRoomUpdateResult] = await Promise.all([
                    client.once(CONTROLLER_NS, 'JOIN_ACCEPT'),
                    host.until(CONTROLLER_NS, 'ROOM_UPDATE', (state, data) =>
                        data.guests.includes(clientId),
                    ),
                    client.once(CONTROLLER_NS, 'ROOM_UPDATE', (state, data) =>
                        data.guests.includes(clientId),
                    ),
                ]);

                expect(clientRoomUpdateResult.data.id).toBe(roomId);
                expect(clientRoomUpdateResult.data.host).toBe(hostId);
                expect(clientRoomUpdateResult.data.guests).toEqual(
                    expect.arrayContaining([clientId]),
                );
                expect(hostRoomUpdateResult.data.id).toBe(roomId);
                expect(hostRoomUpdateResult.data.host).toBe(hostId);
                expect(hostRoomUpdateResult.data.guests).toEqual(
                    expect.arrayContaining([clientId]),
                );
            },
            {
                onExit: () => {
                    host.disconnect();
                    client.disconnect();
                    server.kill();
                },
            },
        );
    });
});
