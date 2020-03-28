import {
    Client,
    RoomChangePayload,
    Messages,
    ResponseWrapper,
    LoginResponsePayload,
} from '@prisel/client';

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
    const loginResponse: ResponseWrapper<LoginResponsePayload> = await client.request(
        Messages.getLogin(client.newId(), 'username'),
    );
    return loginResponse.payload.userId;
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
