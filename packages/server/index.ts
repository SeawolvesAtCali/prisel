import { Context, Socket } from './objects';
import createContext from './createContext';
import debug from './debug';
import './handler';
import { createServer } from './networkUtils';
import clientHandlerRegister, { Handler } from './clientHandlerRegister';
import { parsePacket } from '@monopoly/common/lib/createPacket';

debug('starting server');

process.title = 'monopoly-server';

export const server = createServer();
const context: Context = createContext({
    server,
});
// @ts-ignore
// make the context available when debugging in chrome
global.context = context;

server.on('connection', (socket) => {
    debug('client connected', clientHandlerRegister.map(([messageType]) => messageType).join(' '));
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
    // clientHandlerRegister.forEach(([event, handler]: [string, Handler]) => {
    //     socket.on(event, handler(context, socket));
    // });
    socket.on('disconnect', () => {
        debug('client disconnected');
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
