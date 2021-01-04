import { HEARTBEAT_INTERVAL, Packet } from '@prisel/common';
import http from 'http';
import Koa from 'koa';
import WebSocket from 'ws';
import debug from '../debug';
import { DEBUG_MODE } from '../flags';

export function createServerWithInternalHTTPServer({
    host,
    port,
}: {
    host: string;
    port: number;
}): [WebSocket.Server, http.Server] {
    const app = new Koa();
    app.use((ctx: Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext>) => {
        ctx.body = 'Server is running';
    });
    const httpServer = http.createServer(app.callback());
    const ws = new WebSocket.Server({ server: httpServer });
    httpServer.listen(port, host, undefined, undefined);
    debug(`start serving at ws://${host}:${port}`);
    return [ws, httpServer];
}

export function createServerFromHTTPServer(httpServer: http.Server): WebSocket.Server {
    const ws = new WebSocket.Server({ server: httpServer });
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
    return new Promise<void>((resolve) => {
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

export function emit(client: WebSocket, packet: Packet): Packet | void {
    if (DEBUG_MODE) {
        if (Packet.isAnyCustomAction(packet)) {
            debug(`SERVER: [custom action] ${Packet.toDebugString(packet)}`);
        } else if (Packet.isAnySystemAction(packet)) {
            debug(`SERVER: [system action] ${Packet.toDebugString(packet)}`);
        } else {
            debug(`SERVER: emitting packet without action ${JSON.stringify(packet)}`);
        }
    }
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(Packet.serialize(packet));
        return packet;
    }
}

export function closeSocket(socket: WebSocket) {
    socket.close();
}
