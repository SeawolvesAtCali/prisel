import { Context } from './objects';
import { CONTROLLER_NS, DISPLAY_NS, CHAT_NS, PORT } from '../common/constants';
import createContext from './createContext';
import { handleControllerConnection } from './controllerHandler';
import { handleDisplayConnection } from './displayHandler';
import { handleChatConnection } from './chatHandler';
import SocketIO from 'socket.io';
import debug from './debug';

const io = SocketIO();
debug('starting server');

const context: Context = createContext({
    io,
});

io.of(CONTROLLER_NS).on('connection', handleControllerConnection(context));
io.of(DISPLAY_NS).on('connection', handleDisplayConnection(context));
io.of(CHAT_NS).on('connection', handleChatConnection(context));

io.listen(PORT);
