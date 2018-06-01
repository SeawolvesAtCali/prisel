const io = require('socket.io-client');
const readline = require('readline');
const chatMessages = require('../message/chat');

const socket = io('http://localhost:3000');
const rl = readline.createInterface(process.stdin, process.stdout);
rl.on('line', (line) => {
    socket.emit(...chatMessages.getMessage(line));
    rl.prompt(true);
});

// display what server send
socket.on('broadcast', (data) => {
    console.log(data);
});
