import { Context, Socket } from './objects';
import createContext from './createContext';
import debug from './debug';
import './handler';
import {
    createServer,
    watchForDisconnection,
    getConnectionToken,
    emit,
    createServerFromHTTPServer,
} from './utils/networkUtils';
import clientHandlerRegister, { Handler } from './clientHandlerRegister';
import { parsePacket } from '@prisel/common';
import { handleDisconnect } from './handler/handleDisconnect';
import { getWelcome } from './message/room';
import { GameConfig } from './utils/gameConfig';
import { RoomConfig, BaseRoomConfig } from './utils/roomConfig';
import ConfigManager from './utils/configManager';
import { RoomId } from './objects/room';
import { string } from 'prop-types';
import http from 'http';
import { getClient } from './utils/stateUtils';

interface ServerConfig {
    host: string;
    port: number;
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
    private configManager = new ConfigManager();

    /**
     * Create and start the server and setup listeners for websocket events.
     *
     * @param config configuration for the underlying HTTP Server. If not provided, a [koa](https://koajs.com/) server will be created at localhost:3000.
     */
    constructor(
        config: Pick<ServerConfig, 'host' | 'port'> | Pick<ServerConfig, 'server'> = {
            host: 'localhost',
            port: 3000,
        },
    ) {
        const server =
            'server' in config ? createServerFromHTTPServer(config.server) : createServer(config);
        const context: Context = createContext({
            server,
            getConfigs: this.configManager.get.bind(this.configManager),
        });
        this.context = context;
        context.configManager = this.configManager;

        server.on('connection', (socket) => {
            debug('client connected');
            emit(socket, ...getWelcome());
            socket.on('message', (data: any) => {
                debug(data);
                if (data) {
                    const packet = parsePacket(data);
                    const handler = clientHandlerRegister.get(packet.type);
                    if (!handler) {
                        debug(
                            `Cannot find handler for ${packet.type} in ${Array.from(
                                clientHandlerRegister.messageList,
                            )}`,
                        );
                        return;
                    }
                    handler(context, socket)(packet.payload);
                }
            });

            const connectionToken = getConnectionToken();
            socket.on('disconnect', () => {
                connectionToken.safeDisconnect();
                handleDisconnect(context, socket)({});
                debug('client disconnected');
            });

            watchForDisconnection(socket, connectionToken).then(() => {
                if (!connectionToken.safeDisconnected) {
                    // client is not responding
                    // forcefully terminate connection
                    const client = getClient(context, socket);
                    if (client) {
                        debug(`client ${client.id} lost connection`);
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
     * Register a game to the server. If the game requires special room configuration,
     * a room configuration can also be provided.
     * @param game game configuration.
     * @param room room configuration, if not provided, the base room configuration will be used.
     */
    public register(game: GameConfig, room: RoomConfig = BaseRoomConfig) {
        this.configManager.add(game, room);
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
