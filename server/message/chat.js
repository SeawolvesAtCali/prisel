// @flow

import type { MessageT } from '../objects';

function getBroadcastMessage(username: string, message: string): MessageT {
    return ['BROADCAST', { username, message }];
}
module.exports = { getBroadcastMessage };
