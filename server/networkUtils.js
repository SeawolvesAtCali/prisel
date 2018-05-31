/**
 * Utility functions to perform network calls.
 */

const assert = require('assert');
const constants = require('../common/constants');

function emit(clients, ...data) {
    assert(data.length > 1, 'Did you forget to spread the data using ...?');
    clients.emit(...data);
}

function getAllControllersInRoom(io, roomId) {
    return io.of(constants.CONTROLLER_NS).to(roomId);
}

function getAllDisplaysInRoom(io, roomId) {
    return io.of(constants.DISPLAY_NS).to(roomId);
}

function emitToControllers(io, roomId, ...data) {
    emit(getAllControllersInRoom(io, roomId), ...data);
}

function emitToDisplays(io, roomId, ...data) {
    emit(getAllDisplaysInRoom(io, roomId), ...data);
}

module.exports = {
    emit,
    emitToControllers,
    emitToDisplays,
};
