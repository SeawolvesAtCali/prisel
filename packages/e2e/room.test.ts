import debug from './debug';
import { createClients, untilSuccess, createRoomWithGuests } from './testHelper';
import { Messages } from '@prisel/client';
import { MessageType } from '@prisel/common';

const receivedRoomUpdate = (messageType: string) => MessageType.ROOM_UPDATE === messageType;

describe('create room', () => {
    it('create a room', async () => {
        const [client] = createClients();
        await client.connect();
        await client.login('batman');
        client.emit(...Messages.getCreateRoom('party room'));
        const data = await untilSuccess(client, MessageType.CREATE_ROOM);
        expect(typeof data.roomId).toBe('string');
        client.exit();
    });

    it('create a room, join and then leave', async () => {
        const [client] = createClients();
        await client.connect();
        await client.login('batman');
        client.emit(...Messages.getCreateRoom('room'));
        await untilSuccess(client, MessageType.CREATE_ROOM);
        client.emit(...Messages.getLeave());
        await untilSuccess(client, MessageType.LEAVE);
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
        host.emit(...Messages.getCreateRoom('party room'));
        const roomData = await untilSuccess(host, MessageType.CREATE_ROOM);
        const { roomId } = roomData;
        client.emit(...Messages.getJoin(roomId));
        const [, hostRoomUpdateResult, clientRoomUpdateResult] = await Promise.all([
            untilSuccess(client, MessageType.JOIN),
            host.once(
                (messageType, data) =>
                    MessageType.ROOM_UPDATE === messageType && data.guests.includes(clientId),
            ),
            client.once(
                (messageType, data) =>
                    MessageType.ROOM_UPDATE === messageType && data.guests.includes(clientId),
            ),
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

    it('in a room everyone leaves', async () => {
        const clients = await createRoomWithGuests(2);
        const [host, guest1, guest2] = clients.map(([userId, client]) => client);
        guest1.emit(...Messages.getLeave());
        await Promise.all([
            untilSuccess(guest1, MessageType.LEAVE),
            host.once(receivedRoomUpdate),
            guest2.once(receivedRoomUpdate),
        ]);
        host.emit(...Messages.getLeave());
        await Promise.all([untilSuccess(host, MessageType.LEAVE), guest2.once(receivedRoomUpdate)]);
        guest2.emit(...Messages.getLeave());
        await untilSuccess(guest2, MessageType.LEAVE);
        clients.map(([userId, client]) => client.exit());
    });

    it('in a room host kicks someone', async () => {
        const clients = await createRoomWithGuests(1);
        const [[hostId, host], [guestId, guest]] = clients;
        host.emit(...Messages.getKick(guestId));
        await Promise.all([
            untilSuccess(host, MessageType.KICK),
            untilSuccess(guest, MessageType.LEAVE),
        ]);

        host.exit();
        guest.exit();
    });
});
