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
    gameConfig?: GameConfig;
    roomConfig?: RoomConfig;
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
    private context: Context | undefined;
    private onClose: (() => void) | undefined;

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
            if (config.server) {
                return createServerFromHTTPServer(config.server);
            }
            if (config.host && config.port) {
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
            server,
        });

        this.context = context;

        server.on('connection', (socket) => {
            if (!this.context) {
                return;
            }
            debug('client connected');
            emit(socket, getWelcome());
            socket.on('message', (data: any) => {
                debug(`received socket message`);
                if (!data) {
                    return;
                }
                if (!this.context) {
                    return;
                }
                const packet = Packet.deserialize(data);
                if (!Packet.is(packet)) {
                    debug(`packet structure is invalid ${safeStringify(packet)}`);
                    if (DEBUG_MODE) {
                        const player = getPlayer(this.context, socket);
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
                    if (this.context.requests.isWaitingFor(id)) {
                        this.context.requests.onResponse(packet);
                    } else {
                        debug(`response with id ${id} is unclaimed ${JSON.stringify(packet)}`);
                    }
                    return;
                }
                // handle packet or request
                // systemAction are handled by pre-registered handlers.
                if (Packet.isAnyCustomAction(packet)) {
                    const player = getPlayer(this.context, socket);
                    const room = getRoom(this.context, socket);
                    if (player && room && room.getGamePhase() === GAME_PHASE.GAME) {
                        room.dispatchGamePacket(packet, player);
                    }
                } else if (Packet.isAnySystemAction(packet)) {
                    const systemAction = Packet.getSystemAction(packet);
                    if (!systemAction) {
                        return;
                    }
                    const handler = clientHandlerRegister.get(systemAction);
                    if (!handler) {
                        debug(
                            `Cannot find handler for ${systemAction} in ${Array.from(
                                clientHandlerRegister.messageList,
                            )}`,
                        );
                        return;
                    }
                    handler(this.context, socket)(packet);
                }
            });

            const connectionToken = getConnectionToken();
            socket.on('disconnect', () => {
                connectionToken.safeDisconnect();
                if (this.context) {
                    handleDisconnect(this.context, socket);
                    debug('client disconnected');
                }
            });

            watchForDisconnection(socket, connectionToken).then(() => {
                if (!connectionToken.safeDisconnected) {
                    // client is not responding
                    // forcefully terminate connection
                    const client = getPlayer(this.context, socket);
                    if (client) {
                        debug(`client ${client.getId()} lost connection`);
                    } else {
                        debug('a not logged-in user lost connection');
                    }
                    socket.terminate();
                    if (this.context) {
                        handleDisconnect(this.context, socket);
                    }
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
                this.onClose = undefined;
            }
            this.context = undefined;
        }
    }
}

export default Server;
