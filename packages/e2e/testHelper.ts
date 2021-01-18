import { Client, Messages, Packet } from '@prisel/client';
import { priselpb } from '../common/node_modules/@prisel/protos/dist';

export function createClients(num = 1) {
    return Array.from({ length: num }).map(() => new Client());
}

export function waitForRoomUpdate(client: Client): Promise<priselpb.RoomStateChangePayload> {
    return new Promise((resolve) => {
        const off = client.onRoomStateChange((roomStateChange) => {
            off();
            resolve(roomStateChange);
        });
    });
}

export async function connectAndLogin(client: Client): Promise<string | undefined> {
    await client.connect();
    const loginResponse = await client.request(Messages.getLogin(client.newId(), 'username'));
    return Packet.getPayload(loginResponse, 'loginResponse')?.userId;
}

export async function createLoginedClients(num = 1): Promise<Client[]> {
    return await Promise.all(
        createClients(num).map(async (client) => {
            await client.connect();
            await client.request(Messages.getLogin(client.newId(), 'username'));
            return client;
        }),
    );
}
