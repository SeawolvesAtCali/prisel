import { Server, Context } from './objects';
import debug from './debug';
import createPacket from '@monopoly/common/lib/createPacket';
import WebSocket from 'ws';
import http from 'http';
import Koa from 'koa';

export function createServer({
    host = '0.0.0.0',
    port = Number(process.env.PORT) || 3000,
} = {}): Server {
    const app = new Koa();
    app.use((ctx) => {
        ctx.body = 'Server is running';
    });
    const httpServer = http.createServer(app.callback());
    const ws = new WebSocket.Server({ server: httpServer });
    httpServer.listen(port, host, undefined, undefined);
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
