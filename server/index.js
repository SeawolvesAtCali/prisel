/* eslint-disable */
const io = require('socket.io')();
const readcommand = require('readline');
var rc = readcommand.createInterface(process.stdin, process.stdout);
// type message in terminal(server side) and broadcast to all clients
rc.on('line', function (data) {
    io.sockets.emit('broadcast',data);
    rc.prompt(true);
});

io.on('connection', function (socket) {
    io.sockets.emit('this', { will: 'be received by everyone'});

    socket.on('CHAT', function(data){
        console.log(data);
    })

    socket.on('private message', function (from, msg) {
        console.log('I received a private message by ', from, ' saying ', msg);
    });

    socket.on('disconnect', function () {
        io.emit('user disconnected');
    });
});
io.listen(3000);