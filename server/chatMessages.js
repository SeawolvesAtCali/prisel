function getBroadcastMessage(username, message) {
    return ['BROADCAST', { username, message }];
}
module.exports = { getBroadcastMessage };
