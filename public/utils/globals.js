//const { SerialPortObject } = require('../serial/nmea');

const initGlobals = () => {
  // Global settings for TCP port and IP adress, as well as the "start serial port"-file
  global.settings = {
    port: 6006,
    host: '0.0.0.0',
    messageProtocol: 'IMC',
    /*boatSerialPort: 'COM2',
    boatSerialBaudRate: 4800,
    boatSerialPortObject: null,*/
    manualBoatHeading: 0.0,
    useManualHeading: false,
    mapRotation: true,
  };

  global.camera = {
    id: 1,
    zoom: 1,
    focusMode: 0, // autofocus
    focusPosition: 0, // mm
    exposureMode: 0, // auto
    shutterSpeed: 1000, // 1/s
    iris: 28, // 10 x f-number
    gain: 0,
    tilt: 0, // degrees
  }

  global.cameraSettingsRecieved = {
    id: 1,
    zoom: 1,
    focusMode: 0, // autofocus
    focusPosition: 0, // mm
    exposureMode: 0, // auto
    shutterSpeed: 1000, // 1/s
    iris: 28, // 10 x f-number
    gain: 0,
    tilt: 0, // degrees
  }

  // Initialize a serial object with the port and baud rate given in the global settings
  /*global.settings.boatSerialPortObject = new SerialPortObject(
    global.settings.boatSerialPort,
    global.settings.boatSerialBaudRate,
  );*/

  // Global state objects
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
  global.fromROV = {
    north: 0.0,
    east: 0.0,
    down: 0.0,
    roll: 0.0,
    pitch: 0.0,
    yaw: 0.0,
  };
  global.bias = {
    surge: 0.0,
    sway: 0.0,
    heave: 0.0,
  };

  /**
   * Global mode variable
   * 0 - Manual
   * 1 - DP mode
   * 2 - NF mode
   */
  global.mode = {
    currentMode: 0,
    nfAvailable: false,
    dpAvailable: false,
    manual: 0,
    dp: 1,
    nf: 2,
    maxDPDistance: 3,
  };

  /**
   * In IMC, positive and negative values of velocity is also indicating port/starboard direction
   * Positive velocity values: Starboard / styrbord
   * Negative velocity values: Port / babord
   * Direction property is therefore not needed
   */
  global.netfollowing = {
    distance: 1,
    velocity: 0,
    degree: 0,
    depth: 0,
  };

  /**
   * Add correct settings later
   * Placeholders for X, Y, Z for now
   */
  global.dynamicpositioning = {
    north: 0,
    east: 0,
    down: 0,
    yaw: 0,
  };

  /*
  Contains IMC messages to ROV
  */
  global.toROVIMC = {
    desiredControl: {
      x: global.toROV.surge,
      y: global.toROV.sway,
      z: global.toROV.autodepth ? 0 : global.toROV.heave,
      k: 0.0,
      m: 0.0,
      n: global.toROV.autoheading ? 0 : global.toROV.yaw,
      flags: {
        x: false,
        y: false,
        z: global.toROV.autodepth,
        k: true,
        m: true,
        n: global.toROV.autoheading,
      },
    },
  };

  /* Contains IMC messages from ROV */
  global.fromROVIMC = {
    customEstimatedState: {
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
    },
    entityState: { state: 0, flags: { DP: true, NF: true } },
  };

  // Boat position and heading
  global.boat = {
    latitude: 0,
    longitude: 0,
    heading: 0,
  };
};

module.exports = { initGlobals };
