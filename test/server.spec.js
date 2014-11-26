var config = require('../config');
var server = require('../server');
var mock = require('./quickbot.mock');
server.robot = mock;

var dgram = require('dgram');

var client;

beforeEach(function(done){
  client = dgram.createSocket('udp4');
  client.on('error', function (err){
    console.log('client error:\n' + err.stack);
    client.close();
  });

  client.bind(config.basePort, config.baseAddress, function(){
    done();
  });
});

function sendMessage(msg, cb){
  var buffer = new Buffer('${0}*\n'.replace('{0}', msg));
  if (cb){
    client.send(buffer, 0, buffer.length, config.robotPort, config.robotAddress, cb);
  } else {
    client.send(buffer, 0, buffer.length, config.robotPort, config.robotAddress);
  }
}

describe('API tests', function(){
  describe('Recieve CHECK', function(){
    it('should return greetings message', function(done){
      client.on('message', function(msg){
        msg.toString().should.eql('Hello from QuickBot\n');
        done();
      });

     sendMessage('CHECK');
    });
  });

  describe('Recieve PWM?', function(){
    it('should return PWM values', function(done){
      client.on('message', function(msg){
        msg.toString().should.eql('[100,-100]\n');
        done();
      });

      sendMessage('PWM?');
    });
  });

  describe('Recieve IRVAL?', function(){
    it('should return IRVAL values', function(done){
      client.on('message', function(msg){
        msg.toString().should.eql('[1,2,3,4,5]\n');
        done();
      });

      sendMessage('IRVAL?');
    });
  });

  describe('Recieve ENVAL?', function(){
    it('should return ENVAL values', function(done){
      client.on('message', function(msg){
        msg.toString().should.eql('[200,-200]\n');
        done();
      });

      sendMessage('ENVAL?');
    });
  });

   describe('Recieve ENVEL?', function(){
    it('should return encoder velocity', function(done){
      client.on('message', function(msg){
        msg.toString().should.eql('[20,-20]\n');
        done();
      });

      sendMessage('ENVEL?');
    });
  });

  describe('Recieve RESET', function(){
    it('should reset encoder position to zero', function(done){
      client.on('message', function(msg){
        msg.toString().should.eql('[0,0]\n');
        done();
      });

      sendMessage('RESET');
      sendMessage('ENVAL?');
    });
  });

  describe('Recieve PWM=[values]', function(){
    it('should set PWM values', function(done){
      client.on('message', function(msg){
        msg.toString().should.eql('[50,-50]\n');
        done();
      });
      sendMessage('PWM=[50,-50]');
      setTimeout(sendMessage, 100, 'PWM?');
    });
  });

  describe('Recieve END', function(){
    it('should end program', function(done){
      client.on('message', function(){
        done(false);
      });

      sendMessage('END', function(){
        sendMessage('PWM?');
      });
      setTimeout(done, 100);

    });
  });
});