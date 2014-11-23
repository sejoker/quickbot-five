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

var leftPwm = 100;
var rightPwm = -100;

server.on('message', function(msg, rInfo){
  console.log('message {0} from {address}:{port} recieved'
    .replace('{0}', msg.toString())
    .replace('{address}', rInfo.address)
    .replace('{port}', rInfo.port));

  var msgUpper = msg.toString().toUpperCase();
  switch (msgUpper){
    case 'CHECK': {
      sendMessage('Hello from QuickBot');
    } 
    break;
    case 'PWM': {
      sendMessage('[{0}, {1}]'
        .replace('{0}', leftPwm)
        .replace('{1}', rightPwm));
    }
  }

  // starts with
  if (msgUpper.lastIndexOf('PWM=[') === 0){
    var msgSplitted = msgUpper.split(/[\[\],]+/);
    if (msgSplitted.length === 4){
      leftPwm = parseFloat(msgSplitted[1].trim());
      rightPwm = parseFloat(msgSplitted[2].trim());
    } else {
      console.log('cmd PWM set has incorrect format: ', msgUpper)
    }
  }
});

function sendMessage(msg){
  var responseMsg = new Buffer(msg);
      server.send(responseMsg, 0, responseMsg.length, config.destinationPort, config.destinationAddress, function(){
        console.log(responseMsg.toString(), ' message sent to {0}:{1}'
          .replace('{0}', config.destinationAddress)
          .replace('{1}', config.destinationPort));
      });
}

module.exports = server;
