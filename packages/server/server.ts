import { Context, Socket } from './objects';
import createContext from './createContext';
import debug from './debug';
import './handler';
import {
    createServer,
    watchForDisconnection,
    getConnectionToken,
    emit,
} from './utils/networkUtils';
import clientHandlerRegister, { Handler } from './clientHandlerRegister';
import { parsePacket } from '@prisel/common';
import { handleDisconnect } from './handler/handleDisconnect';
import { getWelcome } from './message/room';
import { GameConfig } from './utils/gameConfig';
import { RoomConfig, BaseRoomConfig } from './utils/roomConfig';
import ConfigManager from './utils/configManager';
import { RoomId } from './objects/room';

/**
 * Server is a wrapper on top of the websocket server.
 * It provides utilities to control the server lifecycle.
 *
 * To create a server, simply call the constructor
 *
 * ```js
 * import { Server } from '@prisel/server';
 * const server = new Server();
 * // Calling server.start() starts the server
 * server.start();
 * ```
 */
export class Server {
    private context: Context;
    private configManager = new ConfigManager();

    /**
     * Start the server and setup listeners for websocket events.
     */
    public start() {
        const server = createServer();
        const context: Context = createContext({
            server,
            getConfigs: this.configManager.get.bind(this.configManager),
        });
        this.context = context;

        server.on('connection', (socket) => {
            debug('client connected');
            emit(socket, ...getWelcome());
            socket.on('message', (data: any) => {
                debug(data);
                if (data) {
                    const packet = parsePacket(data);
                    let handled = false;
                    clientHandlerRegister.forEach(([event, handler]) => {
                        if (event === packet.type) {
                            handler(context, socket)(packet.payload);
                            handled = true;
                        }
                    });
                    if (!handled) {
                        debug(`Cannot find handler for ${packet.type}`);
                    }
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
                    debug(`client ${context.SocketManager.getId(socket)} lost connection`);
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
     * If we need to start a new server, a new Server instance needs to be created.
     */
    public close() {
        if (this.context) {
            this.context.server.close();
            this.context = undefined;
        }
    }
}

export default Server;
