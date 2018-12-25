import Client from '@prisel/client/lib/client';
import { RoomType } from '@prisel/common';

export function createClients(num = 1) {
    return Array.from({ length: num }).map(() => new Client());
}

export const untilSuccess = (client: Client, actionType: RoomType) =>
    client.once(
        (messageType, data) => messageType === RoomType.SUCCESS && data.action === actionType,
    );
