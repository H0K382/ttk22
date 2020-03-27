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

  const [
    cameraState,
    setCameraState,
  ] = useState(remote.getGlobal('camera'));
  // const [tiltInput, setTiltInput] = useState(tilt);

  const shutterSpeeds = [10000, 6000, 4000, 3000, 2000, 1500, 1000, 725, 500, 350, 250, 180, 125, 100, 90, 60, 30, 15, 8, 4, 2, 1];
  const focusPositionValues = [10000, 4000, 2000, 1200, 800, 500, 320, 190, 120, 80, 52, 34, 22, 15, 10]
  const irisValues = [18, 20, 24, 28, 34, 40, 48, 56, 68, 80, 96]
  const gainValues = [28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0]

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

  const handleCameraChange = (e, name) => {
    const value = isNaN(Number(e.target.value)) ? 0 : Number(e.target.value);
    const newCameraState = { ...cameraState, [name]: value };
    setCameraState(newCameraState);
    remote.getGlobal('camera')[name] = value
    sendCameraUpdatedMessage();
  }

  const sendCameraUpdatedMessage = () => {
    updateStyle();
    window.ipcRenderer.send('camera-settings-updated');
  }

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
      <div className="generalSettings">
        <h3>Camera</h3>
        <div className="settingGroup">
          <div className="MessageProtocolMenu">
            <label>Zoom</label>
            <div className="inputContainer">
              <select
                className="MessageProtocolDropdown"
                value={cameraState.zoom}
                onChange={e => handleCameraChange(e, "zoom")}
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
                value={cameraState.focusMode}
                onChange={e => handleCameraChange(e, "focusMode")}
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
                value={cameraState.focusPosition}
                onChange={e => handleCameraChange(e, "focusPosition")}
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
                value={cameraState.exposureMode}
                onChange={e => handleCameraChange(e, "exposureMode")}
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
                value={cameraState.shutterSpeed}
                onChange={e => handleCameraChange(e, "shutterSpeed")}
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
                value={cameraState.iris}
                onChange={e => handleCameraChange(e, "iris")}
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
                value={cameraState.gain}
                onChange={e => handleCameraChange(e, "gain")}
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
      </div>

      <button className="updateSettingsBtn" onClick={sendCameraUpdatedMessage}>
        SEND
      </button>
    </div >
  );
}
