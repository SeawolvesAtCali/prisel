import {
    createClients,
    waitForRoomUpdate,
    createLoginedClients,
    connectAndLogin,
} from './testHelper';
import {
    Messages,
    CreateRoomResponsePayload,
    RoomChangePayload,
    ResponseWrapper,
    JoinResponsePayload,
} from '@prisel/client';

describe('create room', () => {
    it('create a room', async () => {
        const [client] = createClients();
        await client.connect();
        await client.request(Messages.getLogin(client.newId(), 'batman'));
        const response = await client.request(Messages.getCreateRoom(client.newId(), 'party room'));
        expect((response.payload as CreateRoomResponsePayload).room.id).toEqual(expect.any(String));
        client.exit();
    });

    it('create a room, join and then leave', async () => {
        const [client] = createClients();
        await client.connect();
        await client.request(Messages.getLogin(client.newId(), 'batman'));
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
        const { id: roomId } = (createRoomResponse.payload as CreateRoomResponsePayload).room;
        const [hostRoomUpdateResult, clientJoinResponse]: [
            RoomChangePayload,
            ResponseWrapper<JoinResponsePayload>,
        ] = await Promise.all([
            waitForRoomUpdate(host),
            client.request(Messages.getJoin(client.newId(), roomId)),
        ]);

        expect(clientJoinResponse.payload.roomState.players.length).toBe(2);
        expect(clientJoinResponse.payload.roomState.hostId).toBe(hostId);
        expect(clientJoinResponse.payload.roomState.token).toEqual(expect.any(String));
        expect(hostRoomUpdateResult.token).toEqual(
            expect.objectContaining({
                previousToken: expect.any(String),
                token: expect.any(String),
            }),
        );

        host.exit();
        client.exit();
    });

    it('in a room everyone leaves', async () => {
        const [host, guest] = await createLoginedClients(2);
        const createResponse = await host.request(Messages.getCreateRoom(host.newId(), 'room'));
        const roomId = (createResponse.payload as CreateRoomResponsePayload).room.id;
        await Promise.all([
            waitForRoomUpdate(host),
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
