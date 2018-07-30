// @flow

import type { SocketT, MessageT } from './objects';
/**
 * Utility functions to perform network calls.
 */

const constants = require('../common/constants');

function emit(clients: SocketT, messageType: string, data: Object) {
    clients.emit(messageType, data);
}

function join(client: SocketT, roomId: string) {
    client.join(roomId);
}

function leave(client: SocketT, roomId: string) {
    client.leave(roomId);
}

function getAllControllersInRoom(io: any, roomId: string): SocketT {
    return io.of(constants.CONTROLLER_NS).to(roomId);
}

function getAllDisplaysInRoom(io: any, roomId: string): SocketT {
    return io.of(constants.DISPLAY_NS).to(roomId);
}

function emitToControllers(io: any, roomId: string, ...data: MessageT) {
    emit(getAllControllersInRoom(io, roomId), ...data);
}

function emitToDisplays(io: any, roomId: string, ...data: MessageT) {
    emit(getAllDisplaysInRoom(io, roomId), ...data);
}

function emitToChat(io: any, ...data: MessageT) {
    emit(io.of(constants.CHAT_NS), ...data);
}

module.exports = {
    emitToChat,
    emit,
    join,
    leave,
    emitToControllers,
    emitToDisplays,
};
