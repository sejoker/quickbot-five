var config = require('../config');
var dgram = require('dgram');

var client;

beforeEach(function(done){
  client = dgram.createSocket('udp4');
  client.on('error', function (err){
    console.log('client error:\n' + err.stack);
    client.close();
  });

  client.bind(config.destinationPort, config.destinationAddress, function(){
    done();
  });
});


describe('API tests', function(){
  describe('Recieve CHECK', function(){
    it('should return greetings message', function(done){
      client.on('message', function(msg){
        msg.toString().should.eql('Hello from QuickBot');
        done();
      });

      var msg = new Buffer('CHECK');
      client.send(msg, 0, msg.length, config.port, config.address);
    });
  });

  describe('Recieve PWM', function(){
    it('should return PWM values', function(done){
      client.on('message', function(msg){
        msg.toString().should.eql('[100, -100]');
        done();
      });

      var msg = new Buffer('PWM');
      client.send(msg, 0, msg.length, config.port, config.address);
    });
  });

  describe('Recieve PWM=[values]', function(){
    it('should set PWM values', function(done){
      client.on('message', function(msg){
        msg.toString().should.eql('[50, -50]');
        done();
      });
      var msgSet = new Buffer('PWM=[50, -50]');
      client.send(msgSet, 0, msgSet.length, config.port, config.address, function(){
        var msgGet = new Buffer('PWM');
        client.send(msgGet, 0, msgGet.length, config.port, config.address);
      });
    });
  });
});