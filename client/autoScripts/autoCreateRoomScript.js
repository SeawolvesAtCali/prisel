const { getCreateRoom } = require('../message/room');
const { emit, wait, disconnect } = require('../autoScriptUtils');
const constants = require('../../common/constants');

module.exports = {
    actions: [
        emit(constants.CONTROLLER_NS, ...getCreateRoom('party room')),
        wait('CREATE_ROOM_ACCEPT', constants.CONTROLLER_NS),
        disconnect(),
    ],
};
