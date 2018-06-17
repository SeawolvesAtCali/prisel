const { getCreateRoom } = require('../message/room');
const { emit, disconnect } = require('../autoScriptUtils');
const constants = require('../../common/constants');

module.exports = {
    actions: [emit(constants.CONTROLLER_NS, ...getCreateRoom('party room')), disconnect()],
};
