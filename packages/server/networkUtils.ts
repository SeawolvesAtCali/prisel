import { Server, Context } from './objects';
import debug from './debug';
import createPacket from '@monopoly/common/lib/createPacket';
import WebSocket from 'ws';

export function createServer({ host = 'localhost', port = 3000 } = {}): Server {
    const ws = new WebSocket.Server({
        host,
        port,
    });
    debug(`start serving at ws://${host}:${port}`);
    return ws;
}

/**
 * Utility functions to perform network calls.
 */

export function emit(client: WebSocket, messageType: string, data: object) {
    debug(`SERVER: ${messageType} ${JSON.stringify(data)}`);
    client.send(createPacket(messageType, data));
}

export function broadcast(context: Context, roomId: string, messageType: string, data: object) {
    const { StateManager, SocketManager } = context;
    const room = StateManager.rooms[roomId];
    const hostSocket = SocketManager.getSocket(room.host);
    if (hostSocket) {
        emit(hostSocket, messageType, data);
    }
    room.guests.forEach((guest) => {
        const guestSocket = SocketManager.getSocket(guest);
        if (guestSocket) {
            emit(guestSocket, messageType, data);
        }
    });
}

export function closeSocket(socket: WebSocket) {
    socket.close();
}
