import { Socket, Message } from './objects';

/**
 * Utility functions to perform network calls.
 */
import { CONTROLLER_NS, DISPLAY_NS, CHAT_NS } from '../common/constants';

export function emit(clients: Socket, Messageype: string, data: Object) {
    clients.emit(Messageype, data);
}

export function join(client: Socket, roomId: string) {
    client.join(roomId);
}

export function leave(client: Socket, roomId: string) {
    client.leave(roomId);
}

export function getAllControllersInRoom(io: any, roomId: string): Socket {
    return io.of(CONTROLLER_NS).to(roomId);
}

export function getAllDisplaysInRoom(io: any, roomId: string): Socket {
    return io.of(DISPLAY_NS).to(roomId);
}

export function emitToControllers(io: any, roomId: string, ...data: Message) {
    emit(getAllControllersInRoom(io, roomId), ...data);
}

export function emitToDisplays(io: any, roomId: string, ...data: Message) {
    emit(getAllDisplaysInRoom(io, roomId), ...data);
}

export function emitToChat(io: any, ...data: Message) {
    emit(io.of(CHAT_NS), ...data);
}
