/**
 * Clients connects to different namespace based on their types.
 */
const constants = require('../common/constants');

function emit(clients, data) {
    clients.emit();
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
