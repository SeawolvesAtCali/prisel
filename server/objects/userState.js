const Types = require('./baseTypes');
const { error, errorIfChildError } = require('./typeError');

const userStateSchema = {
    isReady: Types.isBoolean,
};

function isUserState(value, path) {
    return errorIfChildError(
        [error('UserState', value, path)],
        Types.isObjectShape(userStateSchema)(value, path),
    );
}

module.exports = {
    isUserState,
};
