import { Context } from './objects';
import createContext from './createContext';
import debug from './debug';
import './handler';
import {
    createServer,
    watchForDisconnection,
    getConnectionToken,
    emit,
    createServerFromHTTPServer,
    deserialize,
} from './utils/networkUtils';
import clientHandlerRegister from './clientHandlerRegister';
import { handleDisconnect } from './handler/handleDisconnect';
import { getWelcome } from './message';
import { GameConfig, BaseGameConfig } from './utils/gameConfig';
import { RoomConfig, BaseRoomConfig } from './utils/roomConfig';
import http from 'http';
import { getPlayer, getRoom } from './utils/stateUtils';
import { isResponse } from '@prisel/common';
import { GAME_PHASE } from './objects/gamePhase';

interface ServerConfig {
    host: string;
    port: number;
    gameConfig?: Partial<GameConfig>;
    roomConfig?: Partial<RoomConfig>;
    server: http.Server;
}
/**
 * Server is a wrapper on top of the websocket server.
 * It provides utilities to control the server lifecycle.
 *
 * To create a server, simply call the constructor.
 *
 * ```js
 * import { Server } from '@prisel/server';
 * const server = new Server(); // By default a new server is started at localhost:3000
 * ```
 *
 * We can also specify the hostname and port number.
 *
 * ```js
 * const server = new Server({host: '0.0.0.0', port: 3000});
 * ```
 *
 * By default, prisel uses [koa](https://koajs.com/) for the underlying HTTP server, to use an existing server instead, we can specify the server property.
 *
 * ```js
 * // use an express server.
 * import express from 'express';
 * import http from 'http';
 *
 * const app = express();
 * const expressServer = http.createServer(express);
 * const server = new Server({server: expressServer});
 * ```
 */
export class Server {
    private context: Context;

    /**
     * Create and start the server and setup listeners for websocket events.
     *
     * @param config configuration for the underlying HTTP Server. If not provided, a [koa](https://koajs.com/) server will be created at localhost:3000.
     */
    constructor(
        config: Omit<ServerConfig, 'host' | 'port'> | Omit<ServerConfig, 'server'> = {
            host: 'localhost',
            port: 3000,
        },
    ) {
        const server =
            'server' in config ? createServerFromHTTPServer(config.server) : createServer(config);
        const gameConfig = config.gameConfig || BaseGameConfig;
        const roomConfig = config.roomConfig || BaseRoomConfig;
        const context: Context = createContext({
            server,
            gameConfig,
            roomConfig,
        });
        this.context = context;

        server.on('connection', (socket) => {
            debug('client connected');
            emit(socket, getWelcome());
            socket.on('message', (data: any) => {
                debug(`received ${data}`);
                if (!data) {
                    return;
                }
                const packet = deserialize(data);
                // handle response
                if (isResponse(packet)) {
                    const { id } = packet;
                    if (context.requests.isWaitingFor(id)) {
                        context.requests.onResponse(packet);
                    }
                    return;
                }
                // handle packet or request
                // systemAction are handled by pre-registered handlers.
                const { systemAction, action } = packet;

                if (action) {
                    const player = getPlayer(context, socket);
                    const room = getRoom(context, socket);
                    if (player && room && room.getGamePhase() === GAME_PHASE.GAME) {
                        room.dispatchGamePacket(packet, player);
                    }
                } else if (systemAction !== undefined) {
                    const handler = clientHandlerRegister.get(systemAction);
                    if (!handler) {
                        debug(
                            `Cannot find handler for ${systemAction} in ${Array.from(
                                clientHandlerRegister.messageList,
                            )}`,
                        );
                        return;
                    }
                    handler(context, socket)(packet);
                }
            });

            const connectionToken = getConnectionToken();
            socket.on('disconnect', () => {
                connectionToken.safeDisconnect();
                handleDisconnect(context, socket);
                debug('client disconnected');
            });

            watchForDisconnection(socket, connectionToken).then(() => {
                if (!connectionToken.safeDisconnected) {
                    // client is not responding
                    // forcefully terminate connection
                    const client = getPlayer(context, socket);
                    if (client) {
                        debug(`client ${client.getId()} lost connection`);
                    } else {
                        debug('a not logged-in user lost connection');
                    }
                    socket.terminate();
                    handleDisconnect(context, socket);
                }
            });
        });
    }

    /**
     * Close the server. After a server is closed, it cannot be restarted.
     * If we need to start a new server, instantiate a new Server.
     */
    public close() {
        if (this.context) {
            this.context.server.close();
            this.context = undefined;
        }
    }
}

export default Server;
