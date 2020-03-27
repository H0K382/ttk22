import React, { useState } from 'react';

import './css/FromROV.css';

const { ipcRenderer } = require('electron');

export default function CameraSettings() {
  const [
    cameraState,
    setCameraState,
  ] = useState({
    id: 1,
    zoom: 1,
    focusMode: 0, // autofocus
    focusPosition: 0, // mm
    exposureMode: 0, // auto
    shutterSpeed: 1000, // 1/s
    iris: 28, // 10 x f-number
    gain: 0,
    tilt: 0, // degrees
  });

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

  const handleCameraChange = (e, name) => {
    const newCameraState = {...cameraState, [name]: isNaN(Number(e.target.value)) ? 0 : Number(e.target.value)}
    setCameraState(newCameraState);
    ipcRenderer.send(
      'rov-mock-up-send-camera-settings',
      newCameraState,
    );
  };

  const shutterSpeeds = [10000, 6000, 4000, 3000, 2000, 1500, 1000, 725, 500, 350, 250, 180, 125, 100, 90, 60, 30, 15, 8, 4, 2, 1];
  const focusPositionValues = [10000, 4000, 2000, 1200, 800, 500, 320, 190, 120, 80, 52, 34, 22, 15, 10]
  const irisValues = [18, 20, 24, 28, 34, 40, 48, 56, 68, 80, 96]
  const gainValues = [28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0]

  return (
    <div className="fromROV">
      <div className="customEstimatedStateSettings">
        <h3>Camera State</h3>
        <div className="settings">
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
      </div>
    </div>
  );
}
