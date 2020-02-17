import { Client, RoomChangePayload, Response, RoomInfoPayload } from '@prisel/client';
import { Messages } from '@prisel/client';

export function createClients(num = 1) {
    return Array.from({ length: num }).map(() => new Client());
}

export function waitForRoomUpdate(client: Client): Promise<RoomChangePayload> {
    return new Promise((resolve) => {
        const off = client.onRoomStateChange((roomStateChange) => {
            off();
            resolve(roomStateChange);
        });
    });
}

export async function connectAndLogin(client: Client): Promise<string> {
    await client.connect();
    const clientInfo = await client.login('username');
    return clientInfo.userId;
}

export async function createLoginedClients(num = 1): Promise<Client[]> {
    return await Promise.all(
        createClients(num).map(async (client) => {
            await client.connect();
            await client.login('username');
            return client;
        }),
    );
}
