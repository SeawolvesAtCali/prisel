/* eslint-disable */
function initChat(){
  console.log("yes");
  greeding();
  addSendMSGListener();
  addRecieveMSGListener();
  document.getElementById("richGame").addEventListener("click", redirRichGame);
  socket.emit('onChatPage');
};

function greeding(){
  socket.on('welcome', function (data) {
    var x = document.getElementById("snackbar");
    console.log(data)
    x.innerHTML = data;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  });
}

function addSendMSGListener(){
  $('form').submit(function(){
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

