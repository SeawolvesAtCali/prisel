import { Context, Socket } from './objects';
import createContext from './createContext';
import debug from './debug';
import './handler';
import { createServer, watchForDisconnection, getConnectionToken } from './networkUtils';
import clientHandlerRegister, { Handler } from './clientHandlerRegister';
import { parsePacket } from '@monopoly/common';
import { handleDisconnect } from './handler/handleDisconnect';

process.stdout.write('starting server');

process.title = 'monopoly-server';

export const server = createServer();
const context: Context = createContext({
    server,
});
// @ts-ignore
// make the context available when debugging in chrome
global.context = context;

server.on('connection', (socket) => {
    debug('client connected');
    socket.on('message', (data: any) => {
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
            socket.terminate();
            handleDisconnect(context, socket);
        }
    });
});

process.on('exit', () => {
    debug('on exit');
    server.close();
});
process.on('SIGINT', () => {
    debug('on siginit');
    server.close();
    process.exit();
});
