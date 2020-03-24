// The App for the VideoWindow. This is where every video-component should go.

import React, { useState } from 'react';
import './css/SettingsApp.css';

const { remote } = window.require('electron');
const MessageProtocols = require('../constants/messageProtocols');

const focusMmToString = (mm) => {
  if (mm > 4000) {
    return 'Over Inf'
  } else if (mm >= 1000) {
    return `${mm / 1000} m`
  } else if (mm >= 10) {
    return `${mm / 10} cm`
  } else {
    return `${mm} mm`
  }
}

export default function SettingsApp() {
  const {
    port,
    host,
    messageProtocol,
    /*boatSerialPort,
    boatSerialBaudRate,*/
    manualBoatHeading,
    useManualHeading,
    mapRotation,
  } = remote.getGlobal('settings');

  const {
    zoom,
    focusMode, // autofocus
    focusPosition, // mm
    exposureMode, // auto
    shutterSpeed, // 1/s
    iris, // 10xf-number
    gain,
    // tilt, // degrees
  } = remote.getGlobal('camera');

  const [portInput, setPortInput] = useState(port);
  const [hostInput, setHostInput] = useState(host);
  const [messageProtocolInput, setMessageProtocolInput] = useState(
    messageProtocol,
  );
  /*const [boatSerialPortInput, setBoatSerialPortInput] = useState(
    boatSerialPort,
  );
  const [boatSerialBaudRateInput, setBoatSerialBaudRateInput] = useState(
    boatSerialBaudRate,
  );*/
  const [headingInput, setHeadingInput] = useState(manualBoatHeading);
  const [useManualInput, setUseManualInput] = useState(useManualHeading);
  const [mapRotationInput, setMapRotationInput] = useState(mapRotation);
  const [inputsChanged, setInputsChanged] = useState([]);

  const [zoomInput, setZoomInput] = useState(zoom);
  const [focusModeInput, setFocusModeInput] = useState(focusMode);
  const [focusPositionInput, setFocusPositionInput] = useState(focusPosition);
  const [exposureModeInput, setExposureModeInput] = useState(exposureMode);
  const [shutterSpeedInput, setShutterSpeedInput] = useState(shutterSpeed);
  const [irisInput, setIrisInput] = useState(iris);
  const [gainInput, setGainInput] = useState(gain);
  // const [tiltInput, setTiltInput] = useState(tilt);

  const shutterSpeeds = [10000, 6000, 4000, 3000, 2000, 1500, 1000, 725, 500, 350, 250, 180, 125, 100, 90, 60, 30, 15, 8, 4, 2, 1];
  const focusPositionValues = [10000, 4000, 2000, 1200, 800, 500, 320, 190, 120, 80, 52, 34, 22, 15, 10]
  const irisValues = [18, 20, 24, 28, 34, 40, 48, 56, 68, 80, 96]
  const gainValues = [28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0]


  // Closes current window - which is the settings-window
  const closeWindow = () => {
    let w = remote.getCurrentWindow();
    w.close();
  };

  // Function run when an input field is run - updates its state and sets changed-class
  const handleChange = (event, setFunction) => {
    const el = event.target;
    const value = isNaN(el.value) ? el.value : parseFloat(el.value)
    setFunction(value);

    el.classList.remove('updatedInput');
    el.classList.add('changedInput');
    if (inputsChanged.indexOf(el) < 0) {
      inputsChanged.push(el);
    }
  };

  // Adds style to inputs that are updated
  const updateStyle = () => {
    inputsChanged.forEach(input => {
      input.classList.remove('changedInput');
      input.classList.add('updatedInput');
    });
    setInputsChanged([]);
  };

  const handleCameraChange = (event, setFunction) => {
    const el = event.target;
    const value = isNaN(el.value) ? el.value : parseFloat(el.value)
    setFunction(value);
    updateCameraSettings();
  }

  // Function which is run on button click or enter click to update values
  const updateSettings = () => {
    remote.getGlobal('settings')['port'] = portInput;
    remote.getGlobal('settings')['host'] = hostInput;
    remote.getGlobal('settings')['messageProtocol'] = messageProtocolInput;
    remote.getGlobal('settings')['manualBoatHeading'] = headingInput;
    remote.getGlobal('settings')['useManualHeading'] = useManualInput;
    remote.getGlobal('settings')['mapRotation'] = mapRotationInput;
    /*remote.getGlobal('settings')['boatSerialPort'] = boatSerialPortInput;
    remote.getGlobal('settings')[
      'boatSerialBaudRate'
    ] = boatSerialBaudRateInput;
    
    try {
      remote.getGlobal('settings')['boatSerialPortObject'].closePort();
      remote.getGlobal('settings')[
        // eslint-disable-next-line no-unexpected-multiline
        'boatSerialPortObject'
      ].openPort(boatSerialPortInput, boatSerialBaudRateInput);
    } catch (error) {
      window.ipcRenderer.send('settings-updated');
    }*/
    updateStyle();
    window.ipcRenderer.send('settings-updated');
  };

  // Function which is run on button click or enter click to update values
  const updateCameraSettings = () => {
    remote.getGlobal('camera')['zoom'] = zoomInput;
    remote.getGlobal('camera')['focusMode'] = focusModeInput;
    remote.getGlobal('camera')['focusPosition'] = focusPositionInput;
    remote.getGlobal('camera')['exposureMode'] = exposureModeInput;
    remote.getGlobal('camera')['shutterSpeed'] = shutterSpeedInput;
    remote.getGlobal('camera')['iris'] = irisInput;
    remote.getGlobal('camera')['gain'] = gainInput;
    updateStyle();
    window.ipcRenderer.send('camera-settings-updated');
  };

  return (
    <div className="SettingsApp">
      <h2>SETTINGS</h2>
      <div className="generalSettings">
        <h3>General</h3>
        <div className="settingGroup">
          <label>TCP Port</label>
          <div className="inputContainer">
            <input
              value={portInput}
              onChange={e => handleChange(e, setPortInput)}
            ></input>
            <div className="inputStatus"></div>
          </div>
        </div>

        <div className="settingGroup">
          <label>Host IP Address</label>
          <div className="settingGroup">
            <label>TCP Port</label>
            <div className="inputContainer">
              <input
                value={portInput}
                onChange={e => handleChange(e, setPortInput)}
              ></input>
              <div className="inputStatus"></div>
            </div>
          </div>

          <div className="settingGroup">
            <label>Host IP Address</label>
            <div className="inputContainer">
              <input
                value={hostInput}
                onChange={e => handleChange(e, setHostInput)}
              ></input>
              <div className="inputStatus"></div>
            </div>
          </div>

          <div className="settingGroup">
            <div className="MessageProtocolMenu">
              <label>Message Protocol</label>
              <div className="inputContainer">
                <input
                  value={hostInput}
                  onChange={e => handleChange(e, setHostInput)}
                ></input>
                <div className="inputStatus"></div>
              </div>
            </div>

            <div className="settingGroup">
              <div className="MessageProtocolMenu">
                <label>Message Protocol</label>
                <div className="inputContainer">
                  <select
                    className="MessageProtocolDropdown"
                    value={messageProtocolInput}
                    onChange={e => handleChange(e, setMessageProtocolInput)}
                  >
                    <option value={MessageProtocols.OLD}>OLD</option>
                    <option value={MessageProtocols.IMC}>IMC</option>
                  </select>
                  <div className="inputStatus"></div>
                </div>
              </div>
            </div>

            {/*<div className="settingGroup">
        <label>Boat serial port</label>
        <div className="inputContainer">
          <input
            value={boatSerialPortInput}
            onChange={e => handleChange(e, setBoatSerialPortInput)}
          />
          <div className="inputStatus"></div>
        </div>
      </div>

      <div className="settingGroup">
        <label>Boat serial baud rate</label>
        <div className="inputContainer">
          <input
            value={boatSerialBaudRateInput}
            onChange={e => handleChange(e, setBoatSerialBaudRateInput)}
          />
          <div className="inputStatus"></div>
        </div>
  </div>*/}

            <div className="settingGroup">
              <label>Manual Boat Heading</label>
              <div className="twoInputs">
                <div className="inputContainer">
                  <input
                    style={{
                      backgroundColor: useManualInput ? 'white' : '#eaeaea',
                    }} //using inline style to avoid interference with inputStatus-style
                    value={headingInput}
                    type="number"
                    step={1}
                    min={0}
                    max={360}
                    onChange={e => handleChange(e, setHeadingInput)}
                  />
                  <div className="inputStatus"></div>
                </div>
                <input
                  className="useManual"
                  checked={useManualInput}
                  type="checkbox"
                  onChange={() => setUseManualInput(!useManualInput)}
                ></input>
              </div>
            </div>

            <div className="settingGroup">
              <label>Rotate Minimap Boat:</label>
              <div>
                <input
                  id="mapRotation"
                  checked={mapRotationInput}
                  type="checkbox"
                  onChange={() => setMapRotationInput(!mapRotationInput)}
                ></input>
              </div>
            </div>

            <button className="updateSettingsBtn" onClick={updateSettings}>
              UPDATE
        </button>
          </div>

          <div className="cameraSettings">
            <h3>Camera</h3>
            <div className="settingGroup">
              <div className="MessageProtocolMenu">
                <label>Zoom</label>
                <div className="inputContainer">
                  <select
                    className="MessageProtocolDropdown"
                    value={zoomInput}
                    onChange={e => handleCameraChange(e, setZoomInput)}
                  >
                    {
                      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, i) => {
                        return <option value={item} key={i}>{item}x</option>
                      })
                    }
                  </select>
                  <div className="inputStatus"></div>
                </div>
              </div>
            </div>

            <div className="settingGroup">
              <div className="MessageProtocolMenu">
                <label>Focus Mode</label>
                <div className="inputContainer">
                  <select
                    className="MessageProtocolDropdown"
                    value={focusModeInput}
                    onChange={e => handleCameraChange(e, setFocusModeInput)}
                  >
                    <option value={0}>Automatic</option>
                    <option value={1}>Manual</option>
                  </select>
                  <div className="inputStatus"></div>
                </div>
              </div>
            </div>

            <div className="settingGroup">
              <div className="MessageProtocolMenu">
                <label>Focus Position</label>
                <div className="inputContainer">
                  <select
                    className="MessageProtocolDropdown"
                    value={focusPositionInput}
                    onChange={e => handleCameraChange(e, setFocusPositionInput)}
                  >
                    {
                      focusPositionValues.map((item, i) => {
                        return <option value={item} key={i}>{focusMmToString(item)}</option>
                      })
                    }
                  </select>
                  <div className="inputStatus"></div>
                </div>
              </div>
            </div>

            <div className="settingGroup">
              <div className="MessageProtocolMenu">
                <label>Exposure Mode</label>
                <div className="inputContainer">
                  <select
                    className="MessageProtocolDropdown"
                    value={exposureModeInput}
                    onChange={e => handleCameraChange(e, setExposureModeInput)}
                  >
                    <option value={0}>Automatic</option>
                    <option value={1}>Manual</option>
                  </select>
                  <div className="inputStatus"></div>
                </div>
              </div>
            </div>

            <div className="settingGroup">
              <div className="MessageProtocolMenu">
                <label>Shutter Speed</label>
                <div className="inputContainer">
                  <select
                    className="MessageProtocolDropdown"
                    value={shutterSpeedInput}
                    onChange={e => handleCameraChange(e, setShutterSpeedInput)}
                  >
                    {
                      shutterSpeeds.map((item, i) => {
                        return <option value={item} key={i}>1/{item}</option>
                      })
                    }
                  </select>
                  <div className="inputStatus"></div>
                </div>
              </div>
            </div>

            <div className="settingGroup">
              <div className="MessageProtocolMenu">
                <label>Iris</label>
                <div className="inputContainer">
                  <select
                    className="MessageProtocolDropdown"
                    value={irisInput}
                    onChange={e => handleCameraChange(e, setIrisInput)}
                  >
                    {
                      irisValues.map((item, i) => {
                        return <option value={item} key={i}>F{item / 10}</option>
                      })
                    }
                  </select>
                  <div className="inputStatus"></div>
                </div>
              </div>
            </div>

            <div className="settingGroup">
              <div className="MessageProtocolMenu">
                <label>Gain</label>
                <div className="inputContainer">
                  <select
                    className="MessageProtocolDropdown"
                    value={gainInput}
                    onChange={e => handleCameraChange(e, setGainInput)}
                  >
                    {
                      gainValues.map((item, i) => {
                        return <option value={item} key={i}>{item} step</option>
                      })
                    }
                  </select>
                  <div className="inputStatus"></div>
                </div>
              </div>
            </div>
            {/* <button className="updateSettingsBtn" onClick={updateCameraSettings}>
              UPDATE
            </button> */}
          </div>
          <button className="closeSettings" onClick={closeWindow}></button>
        </div >
      </ div >
    </ div >
  );
}
