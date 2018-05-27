var socket = io();
$(document).ready(function(){
  addGreedingListener();
  addSendMSGListener();
  addRecieveMSGListener();
  //document.getElementById("richGame").addEventListener("click", redirRichGame);
  socket.emit('welcome', JSON.parse(sessionStorage.getItem('user')).userName);
});

function addGreedingListener(){
  socket.on('welcome', function (data) {
    var x = document.getElementById("snackbar");
    console.log(data)
    x.innerHTML = data;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  });
}

function addSendMSGListener(){
  $('#chatForm').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
}

function addRecieveMSGListener(){
  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
  });
}

