const net = require('net');
const { encode, decode, messages } = require('./IMC/IMC');
const { ipcMain } = require('electron');

const port = 5000;
const messageLength = 256;
const sendInterval = 200;
// const sendInterval = 5000;

// States for IMC ==============================================
/* eslint-disable no-unused-vars */

const states = {
  manual: 0,
  DP: 1,
  NF: 2,
};

/* eslint no-unused-vars: ["error", { "args": "none" }] */
// FROM ROV ==============================================
let entityState = {
  state: states.manual,
  flags: {
    DP: true,
    NF: true,
  },
};

let EstimatedState = {
  N: 0.0,
  E: 0,
  D: 0,
  phi: 0,
  theta: 0,
  psi: 0,
  u: 0,
  v: 0,
  w: 0,
  N_dt: 0,
  E_dt: 0,
  D_dt: 0,
  p: 0,
  q: 0,
  r: 0,
};

let customNetFollow = {
  distance: 132,
  velocity: 1.1,
  net_heading: 2.2,
};
// FROM ROV END ========================================

// TO ROV ==============================================
// MANUAL MODE
let desiredControl = {
  x: 0,
  y: 0,
  z: 0,
  k: 0,
  m: 0,
  n: 0,
  flags: {
    x: true,
    y: true,
    z: true,
    k: true,
    m: true,
    n: true,
  },
};

let lowLevelControlManeuver = {
  desiredHeading: {
    control: { value: 0, z_units: 0 },
    duration: 0,
    custom: 0,
  },
  desiredZ: {
    control: { value: 0, z_units: 0 },
    duration: 0,
    custom: 0,
  },
};
// MANUAL MODE END

// DP MODE
let customGoTo = {
  timeout: 0,
  x: 0,
  y: 0,
  z: 0,
  yaw: 0,
};
// DP MODE END

// NF MODE
let netFollow = {
  timeout: 132,
  distance: 1.1,
  velocity: 2.2,
  depth: 3.3,
  z_units: 3,
};
// NF MODE END
// TO ROV END===========================================

/* eslint-disable no-unused-vars */
// End states IMC ==============================================

const ipcCommunicationTCPServer = () => {
  console.log('Starting ipcCommunicationTCPServer');

  ipcMain.on('rov-mock-up-send-custom-estimated-state', (event, arg) => {
    EstimatedState = arg;
    console.log(
      'Received rov-mock-up-send-custom-estimated-state:',
      EstimatedState,
    );
  });

  ipcMain.on('rov-mock-up-send-custom-nf-state', (event, arg) => {
    customNetFollow = arg;
    console.log('Received rov-mock-up-send-custom-nf-state:', customNetFollow);
  });

  ipcMain.on('rov-mock-up-send-df-available', (event, arg) => {
    entityState.flags.DP = arg;
    console.log('Received rov-mock-up-send-df-available:', entityState);
  });

  ipcMain.on('rov-mock-up-send-nf-available', (event, arg) => {
    entityState.flags.NF = arg;
    console.log('Received rov-mock-up-send-nf-available:', entityState);
  });

  ipcMain.on('startROVMockupServer', () => startServer());
};

const startServer = () => {
  console.log(`Waiting for client to connect to port ${port}`);

  const server = new net.createServer((socket) => {
    console.log(`TCP Server bound to port ${port}.`);

    socket.on('data', (buf) => {
      console.log(`[${Date.now()}] Recieved data from client:`);
      const recievedData = decode(buf);
      try {
        global.mockupWindow.webContents.send(
          'rov-mock-up-send-data',
          recievedData,
        );
      } catch (error) {
        console.log('Could not send more data');
        socket.destroy();
        return;
      }
      Object.keys(recievedData).map((message) => {
        switch (message) {
          case messages.desiredControl:
            // Is in manual mode
            if (entityState.state !== states.manual) {
              entityState.state = states.manual;
              global.mockupWindow.webContents.send(
                'rov-mock-up-send-mode',
                states.manual,
              );
            }
            desiredControl = recievedData[message];
            // TODO: SEND IPC message?
            break;
          case messages.lowLevelControlManeuver.desiredHeading:
            lowLevelControlManeuver.desiredHeading = recievedData[message];
            // TODO: SEND IPC message?
            break;
          case messages.lowLevelControlManeuver.desiredZ:
            lowLevelControlManeuver.desiredZ = recievedData[message];
            // TODO: SEND IPC message?
            break;
          case messages.customGoTo:
            if (entityState.state !== states.DP) {
              entityState.state = states.DP;
              global.mockupWindow.webContents.send(
                'rov-mock-up-send-mode',
                states.DP,
              );
            }
            customGoTo = recievedData[message];
            // TODO: SEND IPC message?
            break;
          case messages.netFollow:
            if (entityState.state !== states.NF) {
              entityState.state = states.NF;
              global.mockupWindow.webContents.send(
                'rov-mock-up-send-mode',
                states.NF,
              );
            }
            netFollow = recievedData[message];
            // TODO: SEND IPC message?
            break;
          default:
            break;
        }
      });
    });

    const sendData = () => {
      // Create IMC message with estimated state and entity state
      console.log(`[${Date.now()}] Sending IMC message:`);
      console.log(EstimatedState);
      console.log(entityState);

      let buf = encode.combine([
        encode.EstimatedState(EstimatedState),
        encode.entityState(entityState),
      ]);

      // Add custom net follow message when mode is NF
      if (entityState.state === states.NF) {
        console.log(customNetFollow);

        let customNetFollowBuf = encode.customNetFollow(customNetFollow);
        buf = encode.combine([buf, customNetFollowBuf]);
      }
      try {
        // Ensures that the buffer will be of size
        socket.write(encode.combine([buf], messageLength));
      } catch (error) {
        clearInterval(sendData);
      }
    };

    setInterval(sendData, sendInterval);

    ipcMain.on('rov-mock-up-send-camera-settings', (event, arg) => {
      camera_settings = encode.customCameraMessage({
        id: arg.id,
        zoom: arg.zoom,
        focus_mode: arg.focusMode,
        focus_position: arg.focusPosition,
        exposure_mode: arg.exposureMode,
        shutter_speed: arg.shutterSpeed,
        iris: arg.iris,
        gain: arg.gain,
      });
      console.log('Received rov-mock-up-send-camera-settings:', arg);
      console.log(
        'Sending camera settings==================================================================',
      );

      socket.write(camera_settings);
    });

    ipcMain.on('rov-mock-up-send-camera-tilt', (event, value) => {
      camera_tilt = encode.setServoPosition({
        id: 1,
        value: value,
      });
      console.log('Received rov-mock-up-send-camera-tilt:', value);
      console.log(
        'Sending camera settings==================================================================',
      );
      console.log('Decoded at mock up:', decode(camera_tilt));

      socket.write(camera_tilt);
    });
  });

  server.listen(port);
};

module.exports = {
  ipcCommunicationTCPServer,
};
