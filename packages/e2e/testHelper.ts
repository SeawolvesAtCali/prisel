import { Client } from '@prisel/client';
import { MessageType } from '@prisel/common';
import { Messages } from '@prisel/client';

export function createClients(num = 1) {
    return Array.from({ length: num }).map(() => new Client());
}

export const untilSuccess = (client: Client, actionType: MessageType) =>
    client.once(
        (messageType, data) => messageType === MessageType.SUCCESS && data.action === actionType,
    );

type UserId = string;
type ClientTuple = [UserId, Client];
export async function createRoomWithGuests(num = 0): Promise<ClientTuple[]> {
    const clients = Array.from({ length: num + 1 }).map(() => new Client());
    const loginResults = await Promise.all(
        clients.map((client) =>
            client
                .connect()
                .then(() => client.login('username'))
                .then((data) => [data.userId, client]),
        ),
    );
    const [host, ...guests] = clients;
    host.emit(...Messages.getCreateRoom('roomname'));
    const createRoomInfo = await untilSuccess(host, MessageType.CREATE_ROOM);
    guests.map((guest) => guest.emit(...Messages.getJoin(createRoomInfo.roomId)));
    await Promise.all(guests.map((guest) => untilSuccess(guest, MessageType.JOIN)));
    return loginResults as ClientTuple[];
}
