 const express = require('express');
 const app = express();
 const socket = require('socket.io');

 server = app.listen(/*process.env.PORT ||*/ 8000, function(){
   console.log("Now Listening!");
 });

io = socket(server);

io.on('connection', (socket) => {
  console.log(socket.id);

  socket.on('SEND_MESSAGE', function(data){
    io.emit('RECEIVE_MESSAGE', data);
  });

  socket.on('FESTREAM', function(img){
    //console.log(img)
    io.emit("BESTREAM", img);
  })
});

 /*app.get("/", function(req, res){
  res.writeHead(200, {"content-Type":"text/plain"});
  res.write("Hello World!");
  res.end();
});*/
