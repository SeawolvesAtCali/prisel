import { Packet, Response } from '@prisel/common';
import http from 'http';
import clientHandlerRegister from './clientHandlerRegister';
import createContext from './createContext';
import debug from './debug';
import { DEBUG_MODE } from './flags';
import { handleDisconnect } from './handler/handleDisconnect';
import './handler/index';
import { getError, getWelcome } from './message';
import { Context } from './objects';
import { GAME_PHASE } from './objects/gamePhase';
import { BaseGameConfig, GameConfig } from './utils/gameConfig';
import {
    createServerFromHTTPServer,
    createServerWithInternalHTTPServer,
    emit,
    getConnectionToken,
    watchForDisconnection,
} from './utils/networkUtils';
import { BaseRoomConfig, RoomConfig } from './utils/roomConfig';
import { safeStringify } from './utils/safeStringify';
import { getPlayer, getRoom } from './utils/stateUtils';

interface ServerConfig {
    host?: string;
    port?: number;
    gameConfig?: Partial<GameConfig>;
    roomConfig?: Partial<RoomConfig>;
    server?: http.Server;
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
    private onClose: () => void;

    /**
     * Create and start the server and setup listeners for websocket events.
     *
     * @param config configuration for the underlying HTTP Server. If not provided, a [koa](https://koajs.com/) server will be created at localhost:3000.
     */
    constructor(
        config: ServerConfig = {
            host: 'localhost',
            port: 3000,
        },
    ) {
        const server = (() => {
            if ('server' in config) {
                return createServerFromHTTPServer(config.server);
            }
            if ('host' in config && 'port' in config) {
                const [wsServer, httpServer] = createServerWithInternalHTTPServer({
                    host: config.host,
                    port: config.port,
                });
                // internally created http server will be closed once WebSocket
                // server is closed. External http server needs to be closed manually.
                this.onClose = () => {
                    httpServer.close();
                };
                return wsServer;
            }
        })();
        if (!server) {
            throw new Error('config missing. need to provide either 1. server or 2. host and port');
        }

        const gameConfig = config.gameConfig || BaseGameConfig;
        const roomConfig = config.roomConfig || BaseRoomConfig;
        const context: Context = createContext({
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
                const packet = Packet.deserialize(data);
                if (!Packet.verify(packet)) {
                    debug(`packet structure is invalid`);
                    if (DEBUG_MODE) {
                        const player = getPlayer(context, socket);
                        if (player) {
                            player.emit(
                                getError('packet structure is invalid', safeStringify(packet)),
                            );
                        } else {
                            debug(`player is not logged in, cannot send error report`);
                        }
                        // TODO send info back to client
                        return;
                    }
                    return;
                }

                // handle response
                if (Response.isResponse(packet)) {
                    const { requestId: id } = packet;
                    if (context.requests.isWaitingFor(id)) {
                        context.requests.onResponse(packet);
                    } else {
                        debug(`response with id ${id} is unclaimed ${JSON.stringify(packet)}`);
                    }
                    return;
                }
                // handle packet or request
                // systemAction are handled by pre-registered handlers.
                if (Packet.isAnyCustomAction(packet)) {
                    const player = getPlayer(context, socket);
                    const room = getRoom(context, socket);
                    if (player && room && room.getGamePhase() === GAME_PHASE.GAME) {
                        room.dispatchGamePacket(packet, player);
                    }
                } else if (Packet.isAnySystemAction(packet)) {
                    const systemAction = Packet.getSystemAction(packet);
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

    public static create(config?: ServerConfig) {
        return new Server(config);
    }

    /**
     * Close the server. After a server is closed, it cannot be restarted.
     * If we need to start a new server, instantiate a new Server.
     */
    public close() {
        if (this.context) {
            this.context.server.close();
            if (this.onClose) {
                this.onClose();
                this.onClose = null;
            }
            this.context = undefined;
        }
    }
}

export default Server;
