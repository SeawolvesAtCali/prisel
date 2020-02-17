import {
    createClients,
    waitForRoomUpdate,
    createLoginedClients,
    connectAndLogin,
} from './testHelper';
import { Messages, RoomInfoPayload, Response } from '@prisel/client';

describe('create room', () => {
    it('create a room', async () => {
        const [client] = createClients();
        await client.connect();
        await client.login('batman');
        const response = await client.request(Messages.getCreateRoom(client.newId(), 'party room'));
        expect((response.payload as RoomInfoPayload).id).toEqual(expect.any(String));
        client.exit();
    });

    it('create a room, join and then leave', async () => {
        const [client] = createClients();
        await client.connect();
        await client.login('batman');
        const createRoomResponse = await client.request(
            Messages.getCreateRoom(client.newId(), 'room'),
        );
        expect(createRoomResponse.ok()).toBe(true);
        const leaveResponse = await client.request(Messages.getLeave(client.newId()));
        expect(leaveResponse.ok()).toBe(true);
        client.exit();
    });

    it('create a room and a client join', async () => {
        const [host, client] = createClients(2);
        const hostId = await connectAndLogin(host);
        const clientId = await connectAndLogin(client);

        const createRoomResponse = await host.request(
            Messages.getCreateRoom(host.newId(), 'party room'),
        );
        const { id: roomId } = createRoomResponse.payload as RoomInfoPayload;
        await waitForRoomUpdate(host);
        const [hostRoomUpdateResult, clientRoomUpdateResult, _] = await Promise.all([
            waitForRoomUpdate(host),
            waitForRoomUpdate(client),
            client.request(Messages.getJoin(client.newId(), roomId)),
        ]);

        expect(clientRoomUpdateResult).toEqual(
            expect.objectContaining({
                newHost: hostId,
                newJoins: expect.arrayContaining([hostId, clientId]),
            }),
        );
        expect(hostRoomUpdateResult).toEqual(
            expect.objectContaining({
                newJoins: [clientId],
            }),
        );
        host.exit();
        client.exit();
    });

    it('in a room everyone leaves', async () => {
        const [host, guest] = await createLoginedClients(2);
        const [createResponse] = await Promise.all([
            host.request(Messages.getCreateRoom(host.newId(), 'room')),
            waitForRoomUpdate(host),
        ]);
        const roomId = (createResponse.payload as RoomInfoPayload).id;
        await Promise.all([
            waitForRoomUpdate(host),
            waitForRoomUpdate(guest),
            guest.request(Messages.getJoin(guest.newId(), roomId)),
        ]);
        await Promise.all([
            waitForRoomUpdate(guest),
            host.request(Messages.getLeave(host.newId())),
        ]);
        await guest.request(Messages.getLeave(guest.newId()));
        host.exit();
        guest.exit();
    });
});
