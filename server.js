var dgram = require('dgram');
var config = require('./config');

var server = dgram.createSocket('udp4');

module.exports = server;

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
      var speed = server.robot.getSpeed();
      sendMessage('[{0},{1}]'
        .replace('{0}', speed.left)
        .replace('{1}', speed.right));
    }
    break;
    case msgFormat.replace('{0}', 'IRVAL?'): {
      sendMessage('[1,2,3,4,5]');
    }
    break;
    case msgFormat.replace('{0}', 'ENVAL?'): {
      var encoderPosition = server.robot.getEncoderPosition();
      sendMessage('[{0},{1}]'
        .replace('{0}', encoderPosition.left)
        .replace('{1}', encoderPosition.right));
    }
    break;
    case msgFormat.replace('{0}', 'ENVEL?'): {
      var encoderVelocity = server.robot.getEncoderVelocity();
      sendMessage('[{0},{1}]'
        .replace('{0}', encoderVelocity.left)
        .replace('{1}', encoderVelocity.right));
    }
    break;
    case msgFormat.replace('{0}', 'RESET'): {
      server.robot.resetEncoderPosition();
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
      var leftPwm = parseFloat(msgSplitted[1].trim());
      var rightPwm = parseFloat(msgSplitted[2].trim());
      server.robot.setSpeed(leftPwm, rightPwm);
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

