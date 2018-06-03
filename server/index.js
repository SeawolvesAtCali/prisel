const socketIO = require('socket.io');
const debug = require('debug')('debug');
const StateManager = require('./stateManager');
const { handleControllerConnection } = require('./controllerHandler');
const { handleDisplayConnection } = require('./displayHandler');
const { handleChatConnection } = require('./chatHandler');

const constants = require('../common/constants');

const io = socketIO();
debug('starting server');
io.of(constants.CONTROLLER_NS).on('connection', handleControllerConnection(StateManager));
io.of(constants.DISPLAY_NS).on('connection', handleDisplayConnection(StateManager));
io.of(constants.CHAT_NS).on('connection', handleChatConnection(StateManager, io));

// connect any other namespaces below

// io.on('connection', (socket) => {
//     io.sockets.emit('this', { will: 'be received by everyone' });

//     socket.on('CHAT', (data) => {
//         debug(data);
//     });

//     socket.on('private message', (from, msg) => {
//         debug('I received a private message by ', from, ' saying ', msg);
//     });

//     socket.on('disconnect', () => {
//         io.emit('user disconnected');
//     });
// });

io.listen(constants.PORT);
