var five = require('johnny-five');

module.exports = Quickbot;

// encoders
var WHEEL_RADIUS = 3.25;  // cm
var TIME_INTERVAL = 1;  // seconds
var TICKS = 16;  // ticks per revolution
var CONST = (2 * Math.PI * WHEEL_RADIUS)/TICKS;
var MAX_DISTANCE = 350; // cm

function Quickbot(){
  // motor's speed
  this.motorSpeed = {
    left: 0,
    right: 0
  };

  this.motorSpeedLimits = {
    max: 255,
    min: -255
  };

  // velocity calculation helper
  this.velocityCounter = { 
    left: 0,
    right: 0
  };
  // encoder velocity
  this.encoderVelocity = { 
    left: 0,
    right: 0
  };

  // encoder position
  this.encoderPosition = { 
    left: 0,
    right: 0
  };

  // sensor distances
  this.sensorDistances = {
    //back left
    bl: 0,
    // forward left
    fl: 0,
    // forward middle
    fm: 0,
    // forward right
    fr: 0,
    // back right
    br: 0
  };

  var board = new five.Board();
  var self = this;

  board.on('ready', function(){
    console.log('board connected');
    var motors = {
      left: new five.Motor([3, 12]),
      right: new five.Motor([11, 13])
    };

    this.repl.inject({
      motors: motors
    });

    self.motors = motors;

    self.updateEncoder(10, 'left');// left
    self.updateEncoder(4, 'right'); // right

    connectSensor(5, self.sensorDistances, 'bl');
    connectSensor(6, self.sensorDistances, 'fl');
    connectSensor(8, self.sensorDistances, 'fm');
    connectSensor(11, self.sensorDistances, 'fr');
    connectSensor(12, self.sensorDistances, 'br');
  });
}

Quickbot.prototype.updateEncoder = function(pin, encoderId){
    var digitalPin = new five.Pin(pin),
      self = this;
    //console.log('encoder on pin ', pin, ' initialized');
    digitalPin.read(function(val){
      if (val != 1) return;
      self.encoderPosition[encoderId] += 1;
      self.velocityCounter[encoderId] += 1;
      //console.log(pin, 'encoded new value: ', val);
    });
};

Quickbot.prototype.updateVelocity = function(){
  var self = this;

  function calcVelocity(self, encoderId){
    self.encoderVelocity[encoderId] = (self.velocityCounter[encoderId] * CONST) / TIME_INTERVAL;
    self.velocityCounter[encoderId] = 0;
  }

  function loop(){
    calcVelocity(self, 'left');
    calcVelocity(self, 'right');
    setTimeout(loop, 1000);
  }

  setTimeout(loop, 1000);
};

Quickbot.prototype.setSpeed = function(leftPwm, rightPwm) {
  var leftSpeed = convertFromPWM(leftPwm); 
  var rightSpeed = convertFromPWM(rightPwm);
  var self = this;

  function updateSingleMotor(motorId, speed){
    // limit input speed if necessary
    self.motorSpeed[motorId] = Math.min(
    Math.max(speed, self.motorSpeedLimits.min),
    self.motorSpeedLimits.max);

    if (self.motorSpeed[motorId] > 0){
      self.motors[motorId].fwd(self.motorSpeed[motorId]);
    } else if (self.motorSpeed[motorId] < 0){
      self.motors[motorId].rev(self.motorSpeed.left);
    } else {
      self.motors[motorId].stop();
    }
  }

  updateSingleMotor('left', leftSpeed);
  updateSingleMotor('right', rightSpeed);
};

Quickbot.prototype.getSensorDistances = function(){
  return [2,2,2,2,2];
  // return [this.sensorDistances.bl,
  //         this.sensorDistances.fl,
  //         this.sensorDistances.fm,
  //         this.sensorDistances.fr,
  //         this.sensorDistances.br];
};

Quickbot.prototype.getEncoderPosition = function(){
  return this.encoderPosition;
};

Quickbot.prototype.resetEncoderPosition = function(){
  this.encoderPosition.left = 0;
  this.encoderPosition.right = 0;
};

Quickbot.prototype.getEncoderVelocity = function(){
  return this.encoderVelocity;
};

Quickbot.prototype.getSpeed = function(){
  return {
    left: convertToPWM(this.motorSpeed.left),
    right: convertToPWM(this.motorSpeed.right)
  };
};

function convertFromPWM(value){
  return value * 2.55;
}

function convertToPWM(value){
  return value / 2.55;
}

function connectSensor(pin, sensorDistances, sensorId){
  var ping = new five.Ping(pin);
  ping.on('data', function(err) {
    //console.log("id: ", pin, "Distance: " + this.cm + " cm");
    if (!err && this.cm < MAX_DISTANCE){
      sensorDistances[sensorId] = (this.cm / 100).toFixed(2);
    }
  });
}