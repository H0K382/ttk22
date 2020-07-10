import React, { useState } from 'react';
import { customEstimatedStateMetadata } from '../constants/imcMetadata';

import './css/FromROV.css';

const { ipcRenderer } = require('electron');

export default function FromROV() {
  const [
    customEstimatedStateMessage,
    setCustomEstimatedStateMessage,
  ] = useState({
    N: 0,
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
  });

  function changeCustomEstimatedState(value, name) {
    let tempState = customEstimatedStateMessage;
    tempState[name] = isNaN(Number(value)) ? 0 : Number(value);
    setCustomEstimatedStateMessage(tempState);
    ipcRenderer.send(
      'rov-mock-up-send-custom-estimated-state',
      customEstimatedStateMessage,
    );
  }

  return (
    <div className="fromROV">
      <div className="customEstimatedStateSettings">
        <h3>Custom Estimated state</h3>
        <div className="settings">
          {customEstimatedStateMetadata.message.map(value => {
            return (
              <div
                className="customEstimatedStateInputBox"
                key={`customEstimatedStateInput${value.name}`}
              >
                <h4 className="customEstimatedStateInputHeader">
                  {value.name}
                </h4>
                <input
                  type="number"
                  className={`customEstimatedStateInput${value.name}`}
                  onChange={e =>
                    changeCustomEstimatedState(e.target.value, value.name)
                  }
                  placeholder={`${customEstimatedStateMessage[value.name]}`}
                ></input>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
