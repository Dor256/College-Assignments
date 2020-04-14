// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

let playerNumber = 0;
let players = {};
io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = {
      x: 50,
      y: 150,
      dead: false,
      no: playerNumber++
    };
  });
  socket.on('movement', function(data) {
    const player = players[socket.id] || {};
    if (player.dead) {
      return;
    }
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
  });
  socket.on('death', function(data) {
    const player = players[data] || {};
    player.dead = true;
  });
});

setInterval(function() {
  io.sockets.emit('state', { players, calc: Math.random() + 1 });
}, 1000 / 50);
