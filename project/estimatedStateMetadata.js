const estimatedStateMetadata = {
    // https://www.lsts.pt/docs/imc/imc-5.4.11/Navigation.html#estimated-state
    name: messages.estimatedState,
    length: 100,
    id: {
      value: 350,
      datatype: datatypes.uint_16t,
    },
     message: [
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