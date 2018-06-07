const Types = require('./baseTypes');

const { isUserState } = require('./userState');
const { error, errorIfChildError } = require('./typeError');

const roomSchema = {
    id: Types.isString,
    name: Types.isString,
    // array of userId
    users: Types.isObjectOf(isUserState),
};

function isRoom(value, path = '') {
    return errorIfChildError(
        [error('Room', value, path)],
        Types.isObjectShape(roomSchema)(value, path),
    );
}

module.exports = {
    isRoom: Types.setTypeName(isRoom, 'Room'),
};
