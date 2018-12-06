import { Context } from './objects';
import { PORT } from '../common/constants';
import createContext from './createContext';
import SocketIO from 'socket.io';
import debug from './debug';
import './handler';
import clientHandlerRegister, { Handler } from './clientHandlerRegister';

const io = SocketIO();

debug('starting server');

const context: Context = createContext({
    io,
});

// @ts-ignore
// make the context available when debugging in chrome
global.context = context;

io.on('connection', (client: SocketIO.Socket) => {
    debug('client connected', clientHandlerRegister.length);
    clientHandlerRegister.forEach(([event, handler]: [string, Handler]) => {
        client.on(event, handler(context, client));
    });
    client.on('disconnect', () => {
        debug('client disconnected');
    });
});

io.listen(PORT);
