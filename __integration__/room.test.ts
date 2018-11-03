import debug from './debug';
import { startServer, runFunc } from '../automation/scriptRunner';
import * as constants from '../common/constants';
import { createClients, untilSuccess } from './testHelper';
import * as roomMessages from '../client/message/room';
import { ChildProcess } from 'child_process';
import RoomType from '../common/message/room';

const { CONTROLLER_NS } = constants;

jest.setTimeout(30000);
describe('create room', () => {
    let server: ChildProcess;
    beforeEach(() => {
        server = startServer();
    });
    it('create a room', async () => {
        const [client] = createClients();
        await runFunc(
            async () => {
                await client.connect();
                await client.login('batman');
                client.emit(CONTROLLER_NS, ...roomMessages.getCreateRoom('party room'));
                const { data } = await untilSuccess(client, CONTROLLER_NS, RoomType.CREATE_ROOM);
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

    it('create a room, join and then leave', async () => {
        const [client] = createClients();
        await runFunc(
            async () => {
                await client.connect();
                await client.login('batman');
                client.emit(CONTROLLER_NS, ...roomMessages.getCreateRoom('room'));
                await untilSuccess(client, CONTROLLER_NS, RoomType.CREATE_ROOM);
                client.emit(CONTROLLER_NS, ...roomMessages.getLeave());
                await untilSuccess(client, CONTROLLER_NS, RoomType.LEAVE);
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
                const { data: hostData } = await host.login('host');
                const hostId = hostData.userId;
                await client.connect();
                const { data: clientData } = await client.login('client');
                const clientId = clientData.userId;
                host.emit(CONTROLLER_NS, ...roomMessages.getCreateRoom('party room'));
                const { data: roomData } = await untilSuccess(
                    host,
                    CONTROLLER_NS,
                    RoomType.CREATE_ROOM,
                );
                const { roomId } = roomData;
                client.emit(CONTROLLER_NS, ...roomMessages.getJoin(roomId));
                const [, hostRoomUpdateResult, clientRoomUpdateResult] = await Promise.all([
                    untilSuccess(client, CONTROLLER_NS, RoomType.JOIN),
                    host.until(CONTROLLER_NS, RoomType.ROOM_UPDATE, (state, data) =>
                        data.guests.includes(clientId),
                    ),
                    client.until(CONTROLLER_NS, RoomType.ROOM_UPDATE, (state, data) =>
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
