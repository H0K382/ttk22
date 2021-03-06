const net = require('net');
const { encodeData, decodeData } = require('./coding');
const { encode, decode, messages } = require('./IMC/IMC');
const { sendVibrationRequest } = require('./../controls/mapping');
const { sendMessage } = require('../utils/IPC');

const messageLength = 256;

var today = new Date();


const messageProtocols = {
  IMC: 'IMC',
  old: 'OLD',
};
let messageProtocol = messageProtocols.IMC;

// How many times the TCP has tried to connect and how many times it can try before quitting.
let connectionAttempts = 0;
const limitAttempts = 5;
let client = null;

// Creates a client that receives and sends data to port 5000
function getConnectedClient() {
  //console.log('Attempting to create TCP client and connect to server..');
  client = new net.Socket();
  messageProtocol = global.settings.messageProtocol;

  client.connect({
    port: global.settings.port,
    host: global.settings.host,
  });

  client.on('connect', function () {
    console.log(`Client: connection established with server!`);

    if (messageProtocol === messageProtocols.old) {
      sendData(client, {
        surge: 0.0,
        sway: 0.0,
        heave: 0.0,
        roll: 0.0,
        pitch: 0.0,
        yaw: 0.0,
        autodepth: false,
        autoheading: false,
      });
    } else {
      sendIMCData(client);
    }
  });

  // Handles receiving data
  client.on('data', function (buf) {
    try {
      if (messageProtocol === messageProtocols.old) {
        let data = decodeData(buf);
        global.fromROV = data;
        sendData(client, global.toROV);
      } else if (messageProtocol === messageProtocols.IMC) {
        const fromROVIMC = decodeImcData(buf);
        if (messages.entityState in fromROVIMC || messages.estimatedState in fromROVIMC) {
          global.fromROVIMC = fromROVIMC;
          const toROVIMC = sendIMCData(client);
          console.log(toROVIMC);
          global.toROVIMC = toROVIMC;
        }
      }
    } catch (error) {
      // console.log('Unable to decode message:');
      // console.log(`Buffer: ${buf.toString('hex').match(/../g).join(' ')}`);
      // console.log(`Buffer length: ${buf.length}`);

      // console.log(error.message);
    }
  });

  // Tries to connect again if server is not opened yet
  client.on('error', function (err) {
    const { code } = err;
    if (code === 'ECONNREFUSED') {
      if (connectionAttempts < limitAttempts) {
        connectionAttempts += 1;
        console.log('Connection attempt failed. Trying again in 500ms..');
        setTimeout(getConnectedClient, 500);
      } else {
        console.log(
          `Giving up after ${connectionAttempts + 1} connection attempts. `,
        );
        connectionAttempts = 0;
      }
      client.destroy();
    }
  });
  return client;
}

function sendData(client, data) {
  /**
   * data should be a object with these fields:
   * {'surge': number,
   *  'sway': number,
   *  'heave': number,
   *  'roll': number,
   *  'pitch': number,
   *  'yaw': number,
   *  'autodepth': bool,
   *  'autoheading': bool,
   * }
   */
  let buf = encodeData(data);
  //console.log(`\n[${Date.now()}] Sending byte array with data:`);
  //console.log(data);
  client.write(buf);
}

function decodeImcData(buf) {
  // try {
    const recievedData = decode(buf, false);
    console.log(recievedData);
  // } catch (error) {
  //   console.log("TCPCLIENT");
  //   console.log(error);
  // }

  // Update mode
  /*
  global.mode = {
    currentMode: 0,
    nfAvailable: false,
    dpAvailable: false,
  };
*/
  if (messages.entityState in recievedData) {
    const entityState = recievedData[messages.entityState];
    global.mode.nfAvailable = entityState.flags.NF;
    global.mode.dpAvailable = entityState.flags.DP;
    // TODO: Handle when ROV tells state is MANUAL
    if (currentModeUnavailable()) {
      setSafetyControls();
    }
  }

  if (messages.customEstimatedState in recievedData) {
    const customEstimatedState = recievedData[messages.customEstimatedState];
    global.fromROV = {
      north: customEstimatedState.N,
      east: customEstimatedState.E,
      down: customEstimatedState.D,
      roll: customEstimatedState.phi,
      pitch: customEstimatedState.theta,
      yaw: customEstimatedState.psi,
    };
  }

  if (messages.estimatedState in recievedData) {
    const estimatedState = recievedData[messages.estimatedState];
    global.fromROV = {
      north: estimatedState.x,
      east: estimatedState.y,
      down: estimatedState.depth,
      roll: estimatedState.phi,
      pitch: estimatedState.theta,
      yaw: estimatedState.psi,
    };
  }

  if (messages.customCameraMessage in recievedData) {
    decodeCameraMessage(recievedData[messages.customCameraMessage]);
  }
  if (messages.setServoPosition in recievedData) {
    decodeCameraTilt(recievedData[messages.setServoPosition]);
  }

  return recievedData;
}

function decodeCameraMessage(cameraMessage) {

  global.cameraSettingsRecieved.id = cameraMessage.id;
  global.cameraSettingsRecieved.zoom = cameraMessage.zoom;
  global.cameraSettingsRecieved.focusMode = cameraMessage.focus_mode; // autofocus
  global.cameraSettingsRecieved.focusPosition = cameraMessage.focus_position; // mm
  global.cameraSettingsRecieved.exposureMode = cameraMessage.exposure_mode; // auto
  global.cameraSettingsRecieved.shutterSpeed = cameraMessage.shutter_speed; // 1/s
  global.cameraSettingsRecieved.iris = cameraMessage.iris; // 10 x f-number
  global.cameraSettingsRecieved.gain = cameraMessage.gain;

  sendMessage('camera-settings-recieved', 'control');
}

function decodeCameraTilt(setServoPositionMessage) {
  const rounded_tilt_in_degrees =
    Math.round(
      ((180 * setServoPositionMessage.value) / Math.PI + Number.EPSILON) * 100,
    ) / 100;
  global.cameraSettingsRecieved.tilt = rounded_tilt_in_degrees;
  sendMessage('camera-settings-recieved', 'control');
}

function sendIMCData(client) {
  /*
  global.toROV = {
    surge: 0.0,
    sway: 0.0,
    heave: 0.0,
    roll: 0.0,
    pitch: 0.0,
    yaw: 0.0,
    autodepth: false,
    autoheading: false,
  };
  */
  let buf;
  const { currentMode, manual, dp, nf } = global.mode;
  if (currentMode === manual) {
    // MANUAL MODE

    // DUNE SPECIFIC
    // Enable control loop
    const controlLoop = {
      enable: currentMode === manual,
      mask: 1,
      scope_ref: parseInt(today.getTime()/100000),
    }

    prebuf = encode.controlLoop(controlLoop);
    console.log(decode(prebuf, true));
    client.write(encode.combine([prebuf], messageLength));

    const desiredControl = {
      x: global.toROV.surge,
      y: global.toROV.sway,
      z: global.toROV.autodepth ? 0 : global.toROV.heave,
      k: 0.0,
      m: global.toROV.pitch,
      n: global.toROV.autoheading ? 0 : global.toROV.yaw,
      flags: {
        x: false,
        y: false,
        z: global.toROV.autodepth,
        k: true,
        m: true,
        n: global.toROV.autoheading,
      },
    };
    
    buf = encode.desiredControl(desiredControl);


    // const desiredPath = {
    //   start_lat: 0,
    //   start_lon: 0,
    //   start_z: 0,
    //   start_z_units: 1,
    //   end_lat: 1,
    //   end_lon: 1,
    //   end_z: 0,
    //   end_z_units: 1,
    //   speed: 2,
    //   speed_units: 0,
    //   lradius: 1,
    //   flags: 255,
    // };

    // buf = encode.desiredPath(desiredPath);



    if (global.toROV.autodepth) {
      /*eslint-disable */
      const lowLevelControlManeuverDesiredZBuf = encode.lowLevelControlManeuver.desiredZ(
        /*eslint-enable */
        {
          value: global.toROV.heave,
          z_units: 0,
        },
        10,
      );
      buf = encode.combine([buf, lowLevelControlManeuverDesiredZBuf]);
    }

    if (global.toROV.autoheading) {
      /*eslint-disable */
      const lowLevelControlManeuverDesiredHeadingBuf = encode.lowLevelControlManeuver.desiredHeading(
        /*eslint-enable */

        { value: global.toROV.yaw },
        10,
      );
      buf = encode.combine([buf, lowLevelControlManeuverDesiredHeadingBuf]);
    }
  }
  if (currentMode === dp) {
    // DYNAMIC POSITIONING

    // TODO: Get proper value from global state
    buf = encode.customGoTo({
      timeout: 10,
      x: global.dynamicpositioning.north,
      y: global.dynamicpositioning.east,
      z: global.dynamicpositioning.down,
      yaw: global.dynamicpositioning.yaw,
    });
  }

  if (currentMode === nf) {
    // NET FOLLOWING

    /*
    global.netfollowing = {
      distance: 0,
      velocity: 0,
      degree: 0,
      depth: 0,
    };
*/
    buf = encode.netFollow({
      timeout: 10,
      distance: global.netfollowing.distance,
      velocity: global.netfollowing.velocity,
      depth: global.netfollowing.depth,
      z_units: 0,
    });
  }

  // if (currentMode === desiredPath){

  //   const desiredPath = {
  //     start_lat: 0,
  //     start_lon: 0,
  //     start_z: 0,
  //     start_z_units: 1,
  //     end_lat: 10,
  //     end_lon: 10,
  //     end_z: 0,
  //     end_z_units: 1,
  //     speed: 2,
  //     speed_units: 1,
  //     lradius: 2,
  //     flags: 11111111,
  //   };
  //   buf = encode.desiredPath(desiredPath);
  // }
  console.log(decode(buf, true));
  client.write(encode.combine([buf], messageLength));
  
  return decode(buf, true);
}

function sendCameraSettings() {
  buf = encode.customCameraMessage({
    id: global.camera.id,
    zoom: global.camera.zoom,
    focus_mode: global.camera.focusMode,
    focus_position: global.camera.focusPosition,
    exposure_mode: global.camera.exposureMode,
    shutter_speed: global.camera.shutterSpeed,
    iris: global.camera.iris,
    gain: global.camera.gain,
  });
  // console.log('Sending camera setting');
  // console.log(global.camera);
  client.write(buf);
}

function sendCameraTilt() {
  buf = encode.setServoPosition({
    id: global.camera.id,
    value: global.camera.tilt,
  });
  // console.log('Sending sendCameraTilt');
  // console.log(global.camera);
  client.write(buf);
}

// Checks if currentmode is available
function currentModeUnavailable() {
  const { currentMode, dpAvailable, nfAvailable } = global.mode;
  return (
    (currentMode === 1 && !dpAvailable) || (currentMode === 2 && !nfAvailable)
  );
}

// Sets to manual and locks autoheading and autodepth at current depth and heading
function setSafetyControls() {
  global.mode.currentMode = 0; // Switch to manual
  global.toROV.autodepth = true; // Start autodepth
  global.toROV.autoheading = true; // Start autoheading
  global.toROV.heave = global.fromROV.down; // Sets heave to current down - heave is used by autodepth
  global.toROV.yaw = global.fromROV.yaw; // Sets yaw to current yaw - yaw is used by autoheading
  sendVibrationRequest(false); // Sends hard vibration to gamepad
}

module.exports = {
  getConnectedClient,
  sendData,
  sendIMCData,
  decodeImcData,
  sendCameraSettings,
  sendCameraTilt,
};
