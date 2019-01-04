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

class Server {
    private context: Context;

    public start() {
        const server = createServer();
        const context: Context = createContext({
            server,
        });
        this.context = context;

        server.on('connection', (socket) => {
            debug('client connected');
            emit(socket, ...getWelcome());
            socket.on('message', (data: any) => {
                debug(data);
                if (data) {
                    const packet = parsePacket(data);
                    clientHandlerRegister.forEach(([event, handler]) => {
                        if (event === packet.type) {
                            handler(context, socket)(packet.payload);
                        }
                    });
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
