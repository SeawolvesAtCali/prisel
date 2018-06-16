const socketIO = require('socket.io');
const debug = require('debug')('debug');
const StateManager = require('./stateManager');
const SocketManager = require('./socketManager');
const { handleControllerConnection } = require('./controllerHandler');
const { handleDisplayConnection } = require('./displayHandler');
const { handleChatConnection } = require('./chatHandler');

const constants = require('../common/constants');

const io = socketIO();
debug('starting server');

const context = {
    StateManager,
    SocketManager: new SocketManager(),
    io,
};

io.of(constants.CONTROLLER_NS).on('connection', handleControllerConnection(context));
io.of(constants.DISPLAY_NS).on('connection', handleDisplayConnection(context));
io.of(constants.CHAT_NS).on('connection', handleChatConnection(context));

io.listen(constants.PORT);
