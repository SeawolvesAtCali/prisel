import Client from '@monopoly/client/lib/client';
import RoomType from '@monopoly/common/lib/message/room';

export function createClients(num = 1) {
    return Array.from({ length: num }).map(() => new Client());
}

export const untilSuccess = (client: Client, actionType: RoomType) =>
    client.once(
        (messageType, data) => messageType === RoomType.SUCCESS && data.action === actionType,
    );
