import topology from "fully-connected-topology";

// const myIp = '127.0.0.1:4001';
// const peerIps = ['127.0.0.1:4002', '127.0.0.1:4003'];

// topology(myIp, peerIps).on('connection', (socket: any) => {
//     socket.on('data', (data: any) => console.log(data));
//     socket.write("Hello World");
// })

var t1 = topology('127.0.0.1:4001', ['127.0.0.1:4002', '127.0.0.1:4003']);
var t2 = topology('127.0.0.1:4002', ['127.0.0.1:4001', '127.0.0.1:4003']);
var t3 = topology('127.0.0.1:4003', ['127.0.0.1:4001', '127.0.0.1:4002']);

t1.on('connection', function(connection: any, peer: any) {
  console.log('t1 is connected to', peer);
});

t2.on('connection', function(connection: any, peer: any) {
  console.log('t2 is connected to', peer);
});

t3.on('connection', function(connection: any, peer: any) {
  console.log('t3 is connected to', peer);
});