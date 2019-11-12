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
            case 'connectmaster':
                socket = io('http://localhost:3000?app_key=X-TOKEN&master_id=' + argv[1].trim(''), {
                            path: '/master'
                        });
                socket.on('connect', () => {
                    console.log('Connected to socket server!');
                });  
                
                socket.on('client_list', (client_socket_list) => {
                    console.log(client_socket_list)
                });
                
                socket.on('reconnecting', (attemptNumber) => {
                    console.log('Reconnecting - ' + attemptNumber);
                });
                break;
            case 'connectclient':
                    socket = io('http://localhost:3000?app_key=X-TOKEN&client_id=' + argv[1].trim(''), {
                                path: '/client'
                            });
                    socket.on('connect', () => {
                        console.log('Connected to socket server!');
                    });  
                    
                    socket.on('reconnecting', (attemptNumber) => {
                        console.log('Reconnecting - ' + attemptNumber);
                    });
                    break;
            case 'list':
                socket.emit('client_list');
                break;
        }
    }
})