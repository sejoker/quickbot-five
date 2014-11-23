var dgram = require('dgram');
var config = require('./config');

var server = dgram.createSocket('udp4');

server.on('error', function (err){
  console.log('server error:\n' + err.stack);
  server.close();
});

server.bind(config.port, config.address);

server.on('listening', function () {
  var address = server.address();
  console.log('server listening ' +
      address.address + ':' + address.port);
});

server.on('message', function(msg, rInfo){
  console.log('message {0} from {1} recieved'
    .replace('{0}', msg.toString())
    .replace('{1}', rInfo.toString()));

  switch (msg.toString().toUpperCase()){
    case 'CHECK': {
      var responseMsg = new Buffer('Hello from QuickBot');
      server.send(responseMsg, 0, responseMsg.length, config.destinationPort, config.destinationAddress, function(){
        console.log(responseMsg.toString(), ' message sent to {0}:{1}'
          .replace('{0}', config.destinationAddress)
          .replace('{1}', config.destinationPort));
      });
    }
  }
});

module.exports = server;
