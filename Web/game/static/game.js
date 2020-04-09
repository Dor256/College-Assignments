const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let frames = 0;

const socket = io();

let jump = false;

const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2
};

const sprites = getSprites(canvas, ctx, state);

function clickedOnButton(clickX, clickY) {
  return clickX >= START_BUTTON.x && clickX <= START_BUTTON.x + START_BUTTON.w && clickY >= START_BUTTON.y && clickY <= START_BUTTON.y + START_BUTTON.h;
}

canvas.addEventListener('click', function(event) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      sounds.SWOOSH.play();
      break;
    case state.game:
      sounds.FLAP.play();
      break;
    case state.over:
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      if (clickedOnButton(clickX, clickY)) {
        sprites.bird.resetSpeed();
        sprites.pipes.reset();
        sprites.score.reset();
        state.current = state.getReady;
      }
      break;
  }
});

canvas.addEventListener('mousedown', function() {
  if (state.current == state.game) {
    jump = true;
  }
});

canvas.addEventListener('mouseup', function() {
  if (state.current == state.game) {
    jump = false;
  }
});

document.addEventListener('keydown', function(event) {
  if (state.current == state.game && event.keyCode == KEYS.UP) {
    jump = true;
    sounds.FLAP.play();
  }
});

document.addEventListener('keyup', function(event) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      break;
    case state.game:
      if (event.keyCode == KEYS.UP) {
        jump = false;
      }
      break;
  }
});


function draw() {
  ctx.fillStyle = Colors.SKY;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  sprites.background.draw();
  sprites.foreground.draw();
  sprites.pipes.draw();
  sprites.bird.draw();
  sprites.getReady.draw();
  sprites.gameOver.draw();
  sprites.score.draw();
};

function update() {
  sprites.bird.update();
  sprites.foreground.update();
  sprites.pipes.update();
};

// function loop() {
//   update();
//   draw();
//   frames++;
//   requestAnimationFrame(loop);
// };

// loop();

socket.emit('new player');

socket.on('state', (players) => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  Object.keys(players).forEach((player) => {
    draw();
    sprites.bird.flap(players[player].flap);
  });
  frames++;
  update();
});

setInterval(function() { socket.emit('jump', jump) }, 1000 / 60);