const socketIO = require('socket.io');
const StateManager = require('./stateManager');
const { handleControllerConnection } = require('./controllerHandler');
const { handleDisplayConnection } = require('./displayHandler');

const constants = require('../common/constants');

const io = socketIO();
console.log('starting server');
io.of(constants.CONTROLLER_NS).on('connection', handleControllerConnection(StateManager));
io.of(constants.DISPLAY_NS).on('connection', handleDisplayConnection(StateManager));

// connect any other namespaces below

// io.of(constants.CHAT_NS).on('connection', handleChatConnection);

io.listen(constants.PORT);
