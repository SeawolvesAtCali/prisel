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

// type message in terminal and broadcast to all clients
const readcommand = require('readline');

const rc = readcommand.createInterface(process.stdin, process.stdout);
rc.on('line', (data) => {
    io.sockets.emit('broadcast', data);
    rc.prompt(true);
});

io.on('connection', (socket) => {
    io.sockets.emit('this', { will: 'be received by everyone' });

    socket.on('CHAT', (data) => {
        console.log(data);
    });

    socket.on('private message', (from, msg) => {
        console.log('I received a private message by ', from, ' saying ', msg);
    });

    socket.on('disconnect', () => {
        io.emit('user disconnected');
    });
});
// io.of(constants.CHAT_NS).on('connection', handleChatConnection);

io.listen(constants.PORT);
