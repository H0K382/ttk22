if (messages.estimatedState in recievedData) {
    const estimatedState = recievedData[messages.estimatedState];
    global.fromROV = {
      north: estimatedState.x,
      east: estimatedState.y,
      down: estimatedState.depth,
      roll: estimatedState.phi,
      pitch: estimatedState.theta,
      yaw: estimatedState.psi,
    };
  }