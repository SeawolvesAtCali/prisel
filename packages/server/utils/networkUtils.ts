import { wsServer, Context } from '../objects';
import debug from '../debug';
import { createPacket, HEARTBEAT_INTERVAL } from '@prisel/common';
import WebSocket from 'ws';
import http from 'http';
import Koa from 'koa';

export function createServer({
    host = '0.0.0.0',
    port = Number(process.env.PORT) || 3000,
} = {}): wsServer {
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

interface ConnectionToken {
    isAlive: boolean;
    safeDisconnect: () => void;
    safeDisconnected: boolean;
}

export function getConnectionToken(): ConnectionToken {
    const token: ConnectionToken = {
        isAlive: true,
        safeDisconnected: false,
        safeDisconnect() {
            token.isAlive = false;
            token.safeDisconnected = true;
        },
    };
    return token;
}

export function watchForDisconnection(socket: WebSocket, connectionToken: ConnectionToken) {
    return new Promise((resolve) => {
        socket.on('pong', () => {
            connectionToken.isAlive = true;
        });
        function noop() {}
        const interval = setInterval(() => {
            if (connectionToken.isAlive === false) {
                clearInterval(interval);
                resolve();
                return;
            }
            socket.ping(noop);
            connectionToken.isAlive = false;
        }, HEARTBEAT_INTERVAL);
    });
}

/**
 * Utility functions to perform network calls.
 */

export function emit(client: WebSocket, messageType: string, data: any) {
    debug(`SERVER: ${messageType} ${JSON.stringify(data)}`);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(createPacket(messageType, data));
    }
}

export function broadcast(context: Context, roomId: string, messageType: string, data: any) {
    const { StateManager, SocketManager } = context;
    const room = StateManager.rooms[roomId];
    if (room) {
        room.players.forEach((player) => {
            const socket = SocketManager.getSocket(player);
            if (socket && socket.readyState === WebSocket.OPEN) {
                emit(socket, messageType, data);
            }
        });
    }
}

export function closeSocket(socket: WebSocket) {
    socket.close();
}
