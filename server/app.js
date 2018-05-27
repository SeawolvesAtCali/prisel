const express = require('express'); // eslint-disable-line
const path = require('path'); // eslint-disable-line
const app = require('express')(); // eslint-disable-line
const http = require('http').Server(app);
const fs = require('fs');
const io = require('socket.io')(http);

app.use('/static', express.static('server/static'));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.get('/chat.html', (req, res) => {
    fs.readFile(`${__dirname}/chat.html`, (error, filedata) => {
        if (error) throw error;
        else res.send(filedata.toString());
    });
});

const user = {};
const room = {};

function handleLoginRequest(socket) {
    socket.on('login', (data) => {
        console.log(data.userName);
        if (user[data.userName]) {
            socket.emit('nameTaken');
        } else {
            user[data.userName] = socket.id;
            socket.emit('authorized', data);
        }
    });
}

io.on('connection', (socket) => {
    handleLoginRequest(socket);
    console.log(`user: ${socket.id}  connected`);
    socket.on('welcome', (userName) => {
        room[socket.id] = userName;
        socket.emit('welcome', `welcome: ${userName}`);
    });
    socket.on('chat message', (msg) => {
        console.log(`${room[socket.id]}: ${msg}`);
        io.emit('chat message', `${room[socket.id]}: ${msg}`);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
