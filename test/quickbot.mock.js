module.exports = {
  leftPwm : 100,
  rightPwm : -100,
  leftEncoderPosition : 200,
  rightEncoderPosition : -200,
  leftEncoderVelocity : 20,
  rightEncoderVelocity : -20,
  getEncoderPosition: function(){
    return {
      left: this.leftEncoderPosition,
      right: this.rightEncoderPosition
    };
  },
  resetEncoderPosition: function(){
    this.leftEncoderPosition = 0;
    this.rightEncoderPosition = 0;
  },
  getEncoderVelocity: function(){
    return {
      left: this.leftEncoderVelocity,
      right: this.rightEncoderVelocity
    };
  },
  getSpeed: function(){
    return {
      left: this.leftPwm,
      right: this.rightPwm
    };
  },
  setSpeed: function(left, right){
    console.log('set speed: ', left, right);
    this.leftPwm = left;
    this.rightPwm = right;
  },
  getSensorDistances: function(){
    return [1,2,3,4,5];
  }
};
