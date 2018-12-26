import Client from '@prisel/client/lib/client';
import { MessageType } from '@prisel/common';

export function createClients(num = 1) {
    return Array.from({ length: num }).map(() => new Client());
}

export const untilSuccess = (client: Client, actionType: MessageType) =>
    client.once(
        (messageType, data) => messageType === MessageType.SUCCESS && data.action === actionType,
    );
