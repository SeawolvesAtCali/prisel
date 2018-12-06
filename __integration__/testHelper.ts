import * as constants from '../common/constants';
import Client from '../client/client';
import RoomType from '../common/message/room';

export function createClients(num = 1) {
    return Array.from({ length: num }).map(() => new Client());
}

const isSuccessFor = (messageType: RoomType) => (state: any, data: any) =>
    data.action === messageType;

export const untilSuccess = (client: Client, actionType: RoomType) =>
    client.until(RoomType.SUCCESS, isSuccessFor(actionType));
