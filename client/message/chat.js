function getMessage(userId, message) {
    return ['CHAT', { userId, message }];
}
module.exports = { getMessage };
