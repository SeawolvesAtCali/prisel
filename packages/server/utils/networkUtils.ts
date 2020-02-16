import debug from '../debug';
import { HEARTBEAT_INTERVAL, StatusPayload, toDebugString } from '@prisel/common';
import WebSocket from 'ws';
import http from 'http';
import Koa from 'koa';
import { Packet, Request, Response } from '@prisel/common';
import { getFailureFor } from '../message';

export function serialize(packet: Packet<any>): string {
    return JSON.stringify(packet);
}

export function deserialize(packet: string): Packet<any> {
    return JSON.parse(packet);
}

export function createServerWithInternalHTTPServer({
    host,
    port,
}: {
    host: string;
    port: number;
}): [WebSocket.Server, http.Server] {
    const app = new Koa();
    app.use((ctx) => {
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

export function emit<T extends Packet<any>>(client: WebSocket, packet: T): T | void {
    const { system_action: systemAction, action, payload } = packet;
    if (action !== undefined) {
        debug(`SERVER: [custom action] ${toDebugString(packet)}`);
    } else if (systemAction !== undefined) {
        debug(`SERVER: [standard action] ${toDebugString(packet)}`);
    } else {
        debug(`SERVER: emitting packet without action ${JSON.stringify(packet)}`);
    }
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(serialize(packet));
        return packet;
    }
}

export function closeSocket(socket: WebSocket) {
    socket.close();
}
