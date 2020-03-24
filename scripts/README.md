# Scripts

## Remote server
This scripts will start server that waits for a connection and runs the provided executable file. After that, it will pass through all the data to FhSim.

Usage:
```javascript
node remoteServer.js <absolute path to .bat file>
```
Remember to be in this, `scripts/`, folder when starting the server.

Look in this file for the `guiPort` to see which port this server listen too. Currently it is hard coded to `5001`.
