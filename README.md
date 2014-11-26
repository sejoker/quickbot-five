
This is the code that runs on the Arduino to control the robot using [Johnny-Five](https://github.com/rwaldron/johnny-five). Based on the work from [quickbot_bbb](https://github.com/o-botics/quickbot_bbb) that uses BeagleBone Black to control the robot.

## Overview
Essentially this code establishes socket (UDP) connection with another device
(BASE) and waits for commands. The commands are either of the form of
directives or queries. An example directive is setting the PWM values of the
motors. An example query is getting IR sensor values.

## Installation
- clone the repo into home directory
- npm install

## Tests
npm test

## Running
- check IP address of BASE and ROBOT (run command on both systems and look for IP
address)

- set BASE and ROBOT IP and PORT in config.js

## Command Set

* Check that the bot is up and running:
  * Command

    "$CHECK*\n"

  * Response

    "Hello from QuickBot\n"


* Get PWM values:
  * Command

    "$PWM?*\n"

  * Example response

    "[50, -50]\n"


* Set PWM values:
  * Command

    "$PWM=[-100,100]*\n"


* Get sensor values:
  * Command

    "$IRVAL?*\n"

  * Example response

    "[80.0, 251.0, 234.1, 12.1, 21.3]\n"

* Get encoder position:
  * Command

    "$ENVAL?*\n"

  * Example response

    "[200, -200]\n"


* Get encoder velocity (tick velocity -- 16 ticks per rotation):
  * Command

    "$ENVEL?*\n"

  * Example response

    "[20.0, -20.0]\n"


* Reset encoder position to zero:
  * Command

    "$RESET*\n"


* End program
  * Command:

    "$END*\n"

