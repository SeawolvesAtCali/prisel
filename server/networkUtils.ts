import { Message } from './objects';
import SocketIO from 'socket.io';
import debug from './debug';
/**
 * Utility functions to perform network calls.
 */

export function emit(
    clients: SocketIO.Socket | SocketIO.Namespace,
    messageType: string,
    data: object,
) {
    debug(`SERVER: ${messageType} ${JSON.stringify(data)}`);
    clients.emit(messageType, data);
}

export function join(client: SocketIO.Socket, roomId: string) {
    client.join(roomId);
}

export function leave(client: SocketIO.Socket, roomId: string) {
    client.leave(roomId);
}

export function broadcastInRoom(io: SocketIO.Server, roomId: string, ...data: Message) {
    emit(io.to(roomId), ...data);
}
