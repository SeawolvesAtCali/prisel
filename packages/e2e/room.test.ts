import { Messages, Packet } from '@prisel/client';
import {
    connectAndLogin,
    createClients,
    createLoginedClients,
    waitForRoomUpdate,
} from './testHelper';

describe('create room', () => {
    it('create a room', async () => {
        const [client] = createClients();
        await client.connect();
        await client.request(Messages.getLogin(client.newId(), 'batman'));
        const response = await client.request(Messages.getCreateRoom(client.newId(), 'party room'));
        expect(Packet.getPayload(response, 'createRoomResponse')?.room?.id).toEqual(
            expect.any(String),
        );
        client.exit();
    });

    it('create a room, join and then leave', async () => {
        const [client] = createClients();
        await client.connect();
        await client.request(Messages.getLogin(client.newId(), 'batman'));
        const createRoomResponse = await client.request(
            Messages.getCreateRoom(client.newId(), 'room'),
        );
        expect(Packet.isStatusOk(createRoomResponse)).toBe(true);
        const leaveResponse = await client.request(Messages.getLeave(client.newId()));
        expect(Packet.isStatusOk(leaveResponse)).toBe(true);
        client.exit();
    });

    it('create a room and a client join', async () => {
        const [host, client] = createClients(2);
        const hostId = await connectAndLogin(host);
        const clientId = await connectAndLogin(client);

        const createRoomResponse = await host.request(
            Messages.getCreateRoom(host.newId(), 'party room'),
        );
        const roomId = Packet.getPayload(createRoomResponse, 'createRoomResponse')?.room?.id;
        expect(roomId).toBeDefined();
        if (roomId) {
            const [hostRoomUpdateResult, clientJoinResponse] = await Promise.all([
                waitForRoomUpdate(host),
                client
                    .request(Messages.getJoin(client.newId(), roomId))
                    .then((response) => Packet.getPayload(response, 'joinResponse')),
            ]);

            expect(clientJoinResponse?.roomState?.players.length).toBe(2);
            expect(clientJoinResponse?.roomState?.hostId).toBe(hostId);
            expect(clientJoinResponse?.roomState?.token).toEqual(expect.any(String));
            expect(hostRoomUpdateResult.token).toEqual(
                expect.objectContaining({
                    previousToken: expect.any(String),
                    token: expect.any(String),
                }),
            );
        }

        host.exit();
        client.exit();
    });

    it('in a room everyone leaves', async () => {
        const [host, guest] = await createLoginedClients(2);
        const createResponse = await host.request(Messages.getCreateRoom(host.newId(), 'room'));
        const roomId = Packet.getPayload(createResponse, 'createRoomResponse')?.room?.id;
        expect(roomId).toBeDefined();
        if (roomId) {
            await Promise.all([
                waitForRoomUpdate(host),
                guest.request(Messages.getJoin(guest.newId(), roomId)),
            ]);
            await Promise.all([
                waitForRoomUpdate(guest),
                host.request(Messages.getLeave(host.newId())),
            ]);
            await guest.request(Messages.getLeave(guest.newId()));
        }
        host.exit();
        guest.exit();
    });
});
