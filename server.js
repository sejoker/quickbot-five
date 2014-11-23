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
var leftEncoderPosition = 200;
var rightEncoderPosition = -200;
var leftEncoderVelocity = 20;
var rightEncoderVelocity = -20;

var msgFormat = '${0}*';

server.on('message', function(msg, rInfo){
  var msgUpper = msg.toString().toUpperCase().replace('\n', '');

  console.log('message {0} from {address}:{port} recieved'
    .replace('{0}', msg.toString())
    .replace('{address}', rInfo.address)
    .replace('{port}', rInfo.port));

  switch (msgUpper){
    case msgFormat.replace('{0}', 'CHECK'): {
      sendMessage('Hello from QuickBot');
    } 
    break;
    case msgFormat.replace('{0}', 'PWM?'): {
      sendMessage('[{0},{1}]'
        .replace('{0}', leftPwm)
        .replace('{1}', rightPwm));
    }
    break;
    case msgFormat.replace('{0}', 'IRVAL?'): {
      sendMessage('[1,2,3,4,5]');
    }
    break;
    case msgFormat.replace('{0}', 'ENVAL?'): {
      sendMessage('[{0},{1}]'
        .replace('{0}', leftEncoderPosition)
        .replace('{1}', rightEncoderPosition));
    }
    break;
    case msgFormat.replace('{0}', 'ENVEL?'): {
      sendMessage('[{0},{1}]'
        .replace('{0}', leftEncoderVelocity)
        .replace('{1}', rightEncoderVelocity));
    }
    break;
    case msgFormat.replace('{0}', 'RESET'): {
      leftEncoderPosition = 0;
      rightEncoderPosition = 0;
    }
    break;
    case msgFormat.replace('{0}', 'END'): {
      server.close();
      console.log('server closed');
    }
    break;
  }

  // starts with
  if (msgUpper.lastIndexOf('$PWM=[') === 0){
    var msgSplitted = msgUpper.split(/[\[\],]+/);
    if (msgSplitted.length === 4){
      leftPwm = parseFloat(msgSplitted[1].trim());
      rightPwm = parseFloat(msgSplitted[2].trim());
    } else {
      console.log('cmd PWM set has incorrect format: ', msgUpper);
    }
  }
});

function sendMessage(msg){
  var responseMsg = new Buffer(msg + '\n');
      server.send(responseMsg, 0, responseMsg.length, config.destinationPort, config.destinationAddress, function(){
        console.log(responseMsg.toString(), ' message sent to {0}:{1}'
          .replace('{0}', config.destinationAddress)
          .replace('{1}', config.destinationPort));
      });
}

module.exports = server;
