const messages = {
  customEstimatedState: 'customEstimatedState',
  entityState: 'entityState',
  desiredControl: 'desiredControl',
  desiredHeading: 'desiredHeading',
  desiredZ: 'desiredZ',
  lowLevelControlManeuver: {
    desiredHeading: 'lowLevelControlManeuver.desiredHeading',
    desiredZ: 'lowLevelControlManeuver.desiredZ',
  },
  customGoTo: 'customGoTo',
  netFollow: 'netFollow',
  customNetFollowState: 'customNetFollowState',
  customCameraMessage: 'customCameraMessage',
  setServoPosition: 'setServoPosition',
  estimatedState: 'estimatedState'
};

const datatypes = {
  uint_8t: {
    name: 'uint_8t',
    length: 1,
  },
  uint_16t: {
    name: 'uint_16t',
    length: 2,
  },
  uint_32t: {
    name: 'uint_32t',
    length: 4,
  },
  fp32_t: {
    name: 'fp32_t',
    length: 4,
  },
  fp64_t: {
    name: 'fp64_t',
    length: 8,
  },
  bitfield: {
    name: 'bitfield',
    length: 1,
  },
  recursive: {
    name: 'recursive',
  },
};

const customEstimatedStateMetadata = {
  // Based on https://www.lsts.pt/docs/imc/imc-5.4.11/Navigation.html#estimated-state, but relative
  name: messages.customEstimatedState,
  length: 62,
  id: {
    value: 1003,
    datatype: datatypes.uint_16t,
  },
  message: [
    { name: 'N', datatype: datatypes.fp32_t },
    { name: 'E', datatype: datatypes.fp32_t },
    { name: 'D', datatype: datatypes.fp32_t },
    { name: 'phi', datatype: datatypes.fp32_t },
    { name: 'theta', datatype: datatypes.fp32_t },
    { name: 'psi', datatype: datatypes.fp32_t },
    { name: 'u', datatype: datatypes.fp32_t },
    { name: 'v', datatype: datatypes.fp32_t },
    { name: 'w', datatype: datatypes.fp32_t },
    { name: 'N_dt', datatype: datatypes.fp32_t },
    { name: 'E_dt', datatype: datatypes.fp32_t },
    { name: 'D_dt', datatype: datatypes.fp32_t },
    { name: 'p', datatype: datatypes.fp32_t },
    { name: 'q', datatype: datatypes.fp32_t },
    { name: 'r', datatype: datatypes.fp32_t },
  ],
};

const entityStateMetadata = {
  // https://www.lsts.pt/docs/imc/imc-5.4.11/Core.html#entity-state
  name: messages.entityState,
  length: 6,
  id: {
    value: 1,
    datatype: datatypes.uint_16t,
  },
  message: [
    { name: 'state', datatype: datatypes.uint_8t },
    {
      name: 'flags',
      datatype: datatypes.bitfield,
      fields: ['DP', 'NF', '', '', '', '', '', ''],
    },
    {
      name: 'description',
      datatype: datatypes.uint_16t,
      value: 131072,
    },
  ],
};

const desiredControlMetadata = {
  // https://www.lsts.pt/docs/imc/imc-5.4.11/Guidance.html#desired-control
  name: messages.desiredControl,
  length: 51,
  id: {
    value: 407,
    datatype: datatypes.uint_16t,
  },
  message: [
    {
      name: 'x',
      datatype: datatypes.fp64_t,
    },
    {
      name: 'y',
      datatype: datatypes.fp64_t,
    },
    {
      name: 'z',
      datatype: datatypes.fp64_t,
    },
    {
      name: 'k',
      datatype: datatypes.fp64_t,
    },
    {
      name: 'm',
      datatype: datatypes.fp64_t,
    },
    {
      name: 'n',
      datatype: datatypes.fp64_t,
    },
    {
      name: 'flags',
      datatype: datatypes.bitfield,
      fields: ['x', 'y', 'z', 'k', 'm', 'n', '', ''],
    },
  ],
};

const desiredHeadingMetadata = {
  // https://www.lsts.pt/docs/imc/imc-5.4.11/Guidance.html#desired-heading
  name: messages.desiredHeading,
  length: 10,
  id: {
    value: 400,
    datatype: datatypes.uint_16t,
  },
  message: [
    {
      name: 'value',
      datatype: datatypes.fp64_t,
    },
  ],
};

const desiredZMetadata = {
  // https://www.lsts.pt/docs/imc/imc-5.4.11/Guidance.html#desired-z
  name: messages.desiredZ,
  length: 7,
  id: {
    value: 401,
    datatype: datatypes.uint_16t,
  },
  message: [
    {
      name: 'value',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'z_units',
      datatype: datatypes.uint_8t,
    },
  ],
};

const lowLevelControlManeuverMetadata = {
  // https://www.lsts.pt/docs/imc/imc-5.4.11/Maneuvering.html#low-level-control-maneuver
  name: 'lowLevelControlManeuver', // This must be treated seperablely because it encapsulates other messages
  id: {
    value: 455,
    datatype: datatypes.uint_16t,
  },
  message: [
    {
      name: 'control',
      datatype: datatypes.recursive,
    },
    {
      name: 'duration',
      datatype: datatypes.uint_16t,
    },
    {
      name: 'custom',
      datatype: datatypes.uint_16t,
    },
  ],
};

const customGoToMetadata = {
  // Based on https://www.lsts.pt/docs/imc/imc-5.4.11/Maneuvering.html, but relative
  name: messages.customGoTo,
  length: 28,
  id: {
    value: 1004,
    datatype: datatypes.uint_16t,
  },
  message: [
    {
      name: 'timeout',
      datatype: datatypes.uint_16t,
    },
    {
      name: 'x',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'y',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'z',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'yaw',
      datatype: datatypes.fp64_t,
    },
  ],
};

const netFollowMetadata = {
  // https://www.lsts.pt/docs/imc/imc-5.4.11/Maneuvering.html#custom-maneuver
  name: messages.netFollow,
  length: 33,
  id: {
    value: 1007,
    datatype: datatypes.uint_16t,
  },
  message: [
    {
      name: 'timeout',
      datatype: datatypes.uint_16t,
    },
    {
      name: 'name',
      datatype: datatypes.uint_32t,
      value: 151110,
    },
    {
      name: 'distance',
      datatype: datatypes.fp64_t,
    },
    {
      name: 'velocity',
      datatype: datatypes.fp64_t,
    },
    {
      name: 'depth',
      datatype: datatypes.fp64_t,
    },
    {
      name: 'z_units',
      datatype: datatypes.uint_8t,
    },
  ],
};

const customNetFollowStateMetadata = {
  // https://www.lsts.pt/docs/imc/imc-5.4.11/Custom.html
  name: messages.customNetFollowState,
  length: 18,
  id: {
    value: 1002,
    datatype: datatypes.uint_16t,
  },
  message: [
    {
      name: 'distance',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'velocity',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'net_heading',
      datatype: datatypes.fp64_t,
    },
  ],
};

const customCameraMessageMetadata = {
  name: messages.customCameraMessage,
  length: 14,
  id: {
    value: 1005,
    datatype: datatypes.uint_16t,
  },
  message: [
    {
      name: 'id',
      datatype: datatypes.uint_8t,
    },
    {
      name: 'zoom',
      datatype: datatypes.uint_8t,
    },
    {
      name: 'focus_mode',
      datatype: datatypes.uint_8t,
    },
    {
      name: 'focus_position',
      datatype: datatypes.uint_16t,
    },
    {
      name: 'exposure_mode',
      datatype: datatypes.uint_8t,
    },
    {
      name: 'shutter_speed',
      datatype: datatypes.uint_16t,
    },
    {
      name: 'iris',
      datatype: datatypes.uint_8t,
    },
    {
      name: 'gain',
      datatype: datatypes.uint_8t,
    },
  ],
};

const setServoPositionMetadata = {
  // https://www.lsts.pt/docs/imc/master/Actuation.html?highlight=actuation#set-servo-position
  name: messages.setServoPosition,
  length: 7,
  id: {
    value: 302,
    datatype: datatypes.uint_16t,
  },
  message: [
    {
      name: 'id',
      datatype: datatypes.uint_8t,
    },
    {
      name: 'value',
      datatype: datatypes.fp32_t,
    },
  ],
};

const estimatedStateMetadata = {
  // https://www.lsts.pt/docs/imc/imc-5.4.11/Navigation.html#estimated-state
  name: messages.estimatedState,
  length: 100,
  id: {
    value: 350,
    datatype: datatypes.uint_16t,
  },
  message: [
    {
      name: 'lat',
      datatype: datatypes.fp64_t,
    },
    {
      name: 'lon',
      datatype: datatypes.fp64_t,
    },
    {
      name: 'height',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'x',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'y',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'z',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'phi',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'theta',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'psi',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'u',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'v',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'w',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'vx',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'vy',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'vz',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'p',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'q',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'r',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'depth',
      datatype: datatypes.fp32_t,
    },
    {
      name: 'alt',
      datatype: datatypes.fp32_t,
    },
  ]
}

module.exports = {
  datatypes,
  messages,
  customEstimatedStateMetadata,
  customNetFollowStateMetadata,
  entityStateMetadata,
  desiredControlMetadata,
  lowLevelControlManeuverMetadata,
  desiredHeadingMetadata,
  desiredZMetadata,
  netFollowMetadata,
  customGoToMetadata,
  customCameraMessageMetadata,
  setServoPositionMetadata,
  estimatedStateMetadata,
};
