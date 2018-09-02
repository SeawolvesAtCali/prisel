import * as constants from '../common/constants';
import Client from '../client/client';

export function createClients(num = 1, namespaces = [constants.CONTROLLER_NS]) {
    return Array.from({ length: num }).map(() => new Client(...namespaces));
}
