/* eslint-disable */
const io = require('socket.io-client');
const readline = require("readline");
const socket = io('http://localhost:3000');
const chatMessages = require('../message/chat');
var rl = readline.createInterface(process.stdin, process.stdout);
rl.on('line', function (line) {
    socket.emit(...chatMessages.getMessage(line));
    rl.prompt(true);
});

// display what server send
socket.on('broadcast', function(data){
    console.log(data);
});

