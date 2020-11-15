const controlLoop = {
    enable: currentMode === manual,
    mask: 1,
    scope_ref: parseInt(today.getTime()/100000),
  }