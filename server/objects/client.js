const Types = require('./baseTypes');

const { error, errorIfChildError } = require('./typeError');

const clientSchema = {
    socket: Types.isObject,
    id: Types.isString,
    username: Types.Optional(Types.isString),
};

function isClient(value, path = '') {
    return errorIfChildError(
        [error('Client', value, path)],
        Types.isObjectShape(clientSchema)(value, path)
    )
}

module.exports = {
    isClient: Types.setTypeName(isClient, 'Client');
}