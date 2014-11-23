var config = require('../config');
var dgram = require('dgram');

var client = dgram.createSocket('udp4');

before(function(done){
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
});