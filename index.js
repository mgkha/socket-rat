var server = require('http').createServer();

var client_io = require('socket.io')(server, {
  path: '/client'
});

var master_io = require('socket.io')(server, {
  path: '/master'
});

const client_socket_list = [];

client_io.use((socket, next) => {
    if (socket.handshake.query.app_key == "X-TOKEN" && socket.handshake.query.client_id){
      return next();
    } else {
      console.log('authentication error');
      return next(new Error('authentication error'));
    }    
  });

client_io.on('connection', function(socket) {
    const client_id = socket.handshake.query.client_id;
    console.log(`client id - [${client_id}] connected!`);
    client_socket_list.push({client_id, socket});
    
    socket.on('disconnect', function () {
      console.log(`client id - [${client_id}] disconnected!`);
    });
});

master_io.use((socket, next) => {
  if (socket.handshake.query.app_key == "X-TOKEN" && socket.handshake.query.master_id){
    return next();
  } else {
    console.log('authentication error');
    return next(new Error('authentication error'));
  }    
});

master_io.on('connection', function(socket) {
  const master_id = socket.handshake.query.master_id;
  console.log(`master id - [${master_id}] connected!`);
    
  socket.on('client_list', function () {
    var clients = client_socket_list.map((clients) => {
      return {
        client_id: clients.client_id,
        ip: clients.socket.handshake.address
      };
    })
    socket.emit('client_list', clients);
  });

  socket.on('disconnect', function () {
    console.log(`master id - [${master_id}] disconnected!`);
  });
});

server.listen(3000, function() {
    console.log('listening on *:3000');
});