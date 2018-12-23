import { Context } from './objects';
import createContext from './createContext';
import { wsServer } from './objects';
import debug from './debug';
import './handler';
import { createServer, watchForDisconnection, getConnectionToken, emit } from './networkUtils';
import clientHandlerRegister, { Handler } from './clientHandlerRegister';
import { parsePacket, RoomType } from '@monopoly/common';
import { handleDisconnect } from './handler/handleDisconnect';
import { getWelcome } from './message/room';

class Server {
    public ws: wsServer;

    public start() {
        const server = createServer();
        this.ws = server;
        const context: Context = createContext({
            server,
        });

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
                handleDisconnect(context, socket);
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

    public close() {
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }
    }
}

export default Server;
