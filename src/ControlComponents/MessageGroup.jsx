import React from 'react';
import PropTypes from 'prop-types';
import './css/MessageGroup.css';
import ValueBox from './ValueBox';
import { fixValue } from '../utils/utils';

const dictionary = {
  // Desired control Values
  x: 'X',
  y: 'Y',
  z: 'Z',
  k: 'K',
  m: 'M',
  n: 'N',

  // Net following values
  timeout: 'Time',
  d: 'Distance',
  z_units: 'Down u.',
  net_heading: "Net angle",

  // Custom Estimated state values

  // Messages
  desiredControl: 'Desired Control',
  'lowLevelControlManeuver.desiredZ': 'Desired Depth',
  'lowLevelControlManeuver.desiredHeading': 'Desired Heading',
  netFollow: 'Net Following',
  customGoTo: 'Dynamic Positioning',
  customEstimatedState: 'Estimated State',
  entityState: 'ROV Mode',
  customNetFollowState: 'Net Following State',
  setServoPosition: 'Camera tilt angle',
};

export default function MessageGroup({ msgName, data, flags, changeEffect }) {
  return (
    <div className="MessageGroup">
      <p className="messageGroupName">{dictionary[msgName] || msgName}</p>
      <div className="messageGroupValues">
        {Object.keys(data).map(key => (
          <ValueBox
            key={key}
            title={dictionary[key] || key}
            value={fixValue(data[key])}
            changeEffect={changeEffect}
            flag={flags ? flags[key] : null}
          />
        ))}
      </div>
    </div>
  );
}

MessageGroup.propTypes = {
  msgName: PropTypes.string,
  data: PropTypes.object,
  flags: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  changeEffect: PropTypes.bool,
};
