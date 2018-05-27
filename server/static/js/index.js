var socket = io();
$(document).ready(function(){
	loginListener();
  	redirRichGameListener();
});

function loginListener(){
	$('#loginForm').submit(function(){
    	socket.emit('login', {'userName': $('#userName').val()});
    	return false;
	});
	socket.on('nameTaken', function(){
		$('#msg').text('The name is exist, choose anther name!');
	});
	socket.on('authorized', function(data){
		sessionStorage.setItem('user', JSON.stringify(data));
		window.location = $('#chat').attr('href');
	});
}

function redirRichGameListener(){
	document.getElementById("richGame").addEventListener("click", function(){
		window.location.href = "/static/richGame/index.html";
	});
}

