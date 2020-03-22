import { Client } from '@prisel/client';

export async function createClient() {
    const client = new Client('ws://localhost:3000');
    await client.connect();
    return client;
}
