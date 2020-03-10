const net = require('net');
const { runCommand } = require('../public/launch/launchFile')
const { encode } = require('../public/TCP/IMC/IMC')

console.log(`Arguments: ${process.argv}`);
const guiPort = 5001;
const fhSimRort = 5000;
let client;

function runFhSim() {
  // Launching FhSim
  console.log(`Trying to run file: ${process.argv[2]}`);
  runCommand(process.argv[2]);

  // Starting client to connect to FhSim
  client = new net.Socket();
  client.connect({
    port: fhSimRort,
    host: '127.0.0.1',
  });

  // Needs to send data to FhSim on connection
  client.on('connect', () => {
    // client.write(buf) TODO
    buf = encode.desiredControl({
      x: 0,
      y: 0,
      z: 0,
      k: 0.0,
      m: 0,
      n: 0,
      flags: {
        x: false,
        y: false,
        z: false,
        k: true,
        m: false,
        n: false,
      },
    });
    client.write(buf);
  });
}

let hasRunFhSim = false;
// This server communicates with a remote machine
// It will only pass through the messages it recieves from the client to FhSim
const server = new net.createServer(socket => {
  socket.on('data', buf => {
    // Run FhSim the first time someone connects
    if (!hasRunFhSim) {
      console.log('GUI connected');
      runFhSim();
      hasRunFhSim = true;
      // Pass through the message to the GUI
      client.on('data', buf => {
        console.log('Sending data from FhSim to GUI');
        socket.write(buf);
      })
    } else {
      console.log('Sending data from GUI to FhSim');
      client.write(buf);
    }
  })
});

console.log(`Listening on port ${guiPort}`);
server.listen(guiPort);