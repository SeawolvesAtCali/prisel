import debug from './debug';
import { createClients, untilSuccess } from './testHelper';
import * as roomMessages from '@monopoly/client/lib/message/room';
import RoomType from '@monopoly/common/lib/message/room';

jest.setTimeout(30000);
describe('create room', () => {
    it('create a room', async () => {
        const [client] = createClients();
        await client.connect();
        await client.login('batman');
        client.emit(...roomMessages.getCreateRoom('party room'));
        const data = await untilSuccess(client, RoomType.CREATE_ROOM);
        expect(typeof data.roomId).toBe('string');
        client.exit();
    });

    it('create a room, join and then leave', async () => {
        const [client] = createClients();
        await client.connect();
        await client.login('batman');
        client.emit(...roomMessages.getCreateRoom('room'));
        await untilSuccess(client, RoomType.CREATE_ROOM);
        client.emit(...roomMessages.getLeave());
        await untilSuccess(client, RoomType.LEAVE);
        client.exit();
    });

    it('create a room and a client join', async () => {
        const [host, client] = createClients(2);

        await host.connect();
        const hostData = await host.login('host');
        const hostId = hostData.userId;
        await client.connect();
        const clientData = await client.login('client');
        const clientId = clientData.userId;
        host.emit(...roomMessages.getCreateRoom('party room'));
        const roomData = await untilSuccess(host, RoomType.CREATE_ROOM);
        const { roomId } = roomData;
        client.emit(...roomMessages.getJoin(roomId));
        const [, hostRoomUpdateResult, clientRoomUpdateResult] = await Promise.all([
            untilSuccess(client, RoomType.JOIN),
            host.onceWhen(RoomType.ROOM_UPDATE, (state, data) => data.guests.includes(clientId)),
            client.onceWhen(RoomType.ROOM_UPDATE, (state, data) => data.guests.includes(clientId)),
        ]);

        expect(clientRoomUpdateResult.id).toBe(roomId);
        expect(clientRoomUpdateResult.host).toBe(hostId);
        expect(clientRoomUpdateResult.guests).toEqual(expect.arrayContaining([clientId]));
        expect(hostRoomUpdateResult.id).toBe(roomId);
        expect(hostRoomUpdateResult.host).toBe(hostId);
        expect(hostRoomUpdateResult.guests).toEqual(expect.arrayContaining([clientId]));
        host.exit();
        client.exit();
    });
});
