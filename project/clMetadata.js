const controlLoopMetadata = {
    // https://www.lsts.pt/docs/imc/imc-5.4.11/Vehicle%20Supervision.html#control-loops
    name: messages.controlLoop,
    length: 60,
    id: {
      value: 507,
      datatype: datatypes.uint_16t,
    },
    message: [
      {
        name: 'enable',
        datatype: datatypes.uint_8t,
      },
      {
        name: 'mask',
        datatype: datatypes.bitfield,
        fields: ['1']
      },
      {
        name: 'scope_ref',
        datatype: datatypes.uint_32t,
      },
    ],
  };