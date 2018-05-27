
var express = require('express');
	path = require('path'),
	app = require('express')(),
	http = require('http').Server(app),
	fs = require("fs"),
 	io = require('socket.io')(http);


app.use('/static', express.static('server/static'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/chat.html', function(req, res) {
	fs.readFile(__dirname + '/chat.html',function(error, filedata){
	    if(error) throw error;
	    else 
	    res.send(filedata.toString());
	});
});


var user = {};
var room = {};

io.on('connection', function(socket){
	handleLoginRequest(socket);
	console.log('user: ' + socket.id + '  connected');	
	socket.on('welcome', function(userName){
		room[socket.id] = userName;
		socket.emit('welcome', 'welcome: '+userName);
	});
	socket.on('chat message', function(msg){
		console.log(room[socket.id] + ': ' + msg);
    	io.emit('chat message', room[socket.id] + ': ' + msg);
  	});
	socket.on('disconnect', function(){
    	console.log('user disconnected');
  	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function handleLoginRequest(socket){
	socket.on('login', function(data){
    	console.log(data.userName);
    	if(user[data.userName]){
    		socket.emit('nameTaken');
    	}else{
    		user[data.userName] = socket.id;
    		socket.emit('authorized', data);
    	}
  	});
}