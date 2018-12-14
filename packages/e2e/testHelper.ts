import Client from '@monopoly/client/lib/client';
import RoomType from '@monopoly/common/lib/message/room';

export function createClients(num = 1) {
    return Array.from({ length: num }).map(() => new Client());
}

const isSuccessFor = (messageType: RoomType) => (state: any, data: any) =>
    data.action === messageType;

export const untilSuccess = (client: Client, actionType: RoomType) =>
    client.onceWhen(RoomType.SUCCESS, isSuccessFor(actionType));
