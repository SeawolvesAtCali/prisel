import { Context, Socket } from './objects';
import createContext from './createContext';
import debug from './debug';
import './handler';
import {
    createServer,
    watchForDisconnection,
    getConnectionToken,
    emit,
    broadcast,
} from './utils/networkUtils';
import clientHandlerRegister, { Handler } from './clientHandlerRegister';
import { parsePacket } from '@prisel/common';
import { handleDisconnect } from './handler/handleDisconnect';
import { getWelcome } from './message/room';
import { GameConfig } from './utils/gameConfig';
import { RoomConfig, BaseRoomConfig } from './utils/roomConfig';
import ConfigManager from './utils/configManager';

export class Server {
    private context: Context;
    private configManager = new ConfigManager();

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

    public register(game: GameConfig, room: RoomConfig = BaseRoomConfig) {
        this.configManager.add(game, room);
    }

    public broadcast(roomId: any, messageType: string, data: any) {
        if (this.context) {
            broadcast(this.context, roomId, messageType, data);
        }
    }

    public emit(client: Socket, messageType: string, data: any) {
        if (this.context) {
            emit(client, messageType, data);
        }
    }

    public close() {
        if (this.context) {
            this.context.server.close();
            this.context = undefined;
        }
    }
}

export default Server;
