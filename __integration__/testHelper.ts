import * as constants from '../common/constants';
import Client from '../client/client';
import RoomType from '../common/message/room';

export function createClients(num = 1, namespaces = [constants.CONTROLLER_NS]) {
    return Array.from({ length: num }).map(() => new Client(...namespaces));
}

const isSuccessFor = (messageType: RoomType) => (state: any, data: any) =>
    data.action === messageType;

export const untilSuccess = (client: Client, namespace: string, actionType: RoomType) =>
    client.until(namespace, RoomType.SUCCESS, isSuccessFor(actionType));
