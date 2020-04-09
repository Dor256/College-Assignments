const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let frames = 0;

const socket = io();

let movement = {
  up: false,
  down: false,
  left: false,
  right: false
}

const state = {
  current: 1,
  getReady: 0,
  game: 1,
  over: 2
};

const sprites = getSprites(canvas, ctx, state);

function clickedOnButton(clickX, clickY) {
  return clickX >= START_BUTTON.x && clickX <= START_BUTTON.x + START_BUTTON.w && clickY >= START_BUTTON.y && clickY <= START_BUTTON.y + START_BUTTON.h;
}

// canvas.addEventListener('click', function(event) {
//   switch (state.current) {
//     case state.getReady:
//       state.current = state.game;
//       sounds.SWOOSH.play();
//       break;
//     case state.game:
//       sounds.FLAP.play();
//       break;
//     case state.over:
//       const rect = canvas.getBoundingClientRect();
//       const clickX = event.clientX - rect.left;
//       const clickY = event.clientY - rect.top;

//       if (clickedOnButton(clickX, clickY)) {
//         sprites.bird.resetSpeed();
//         sprites.pipes.reset();
//         sprites.score.reset();
//         state.current = state.getReady;
//       }
//       break;
//   }
// });

// canvas.addEventListener('mousedown', function() {
//   if (state.current == state.game) {
//     jump = true;
//   }
// });

// canvas.addEventListener('mouseup', function() {
//   switch (event.keyCode) {
//     case KEYS.LEFT:
//     case KEYS.A:
//       movement = { ...movement, left: true };
//       break;
//     case KEYS.UP:
//     case KEYS.W:
//       movement = { ...movement, up: true };
//       break;
//     case KEYS.RIGHT:
//     case KEYS.D:
//       movement = { ...movement, rigt: true };
//       break;
//     case KEYS.DOWN:
//     case KEYS.S:
//       movement = { ...movement, down: true };;
//       break;
//   }
// });

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case KEYS.LEFT:
    case KEYS.A:
      movement = { ...movement, left: true };
      break;
    case KEYS.UP:
    case KEYS.W:
      movement = { ...movement, up: true };
      break;
    case KEYS.RIGHT:
    case KEYS.D:
      movement = { ...movement, right: true };
      break;
    case KEYS.DOWN:
    case KEYS.S:
      movement = { ...movement, down: true };;
      break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case KEYS.LEFT:
    case KEYS.A:
      movement = { ...movement, left: false };
      break;
    case KEYS.UP:
    case KEYS.W:
      movement = { ...movement, up: false };
      break;
    case KEYS.RIGHT:
    case KEYS.D:
      movement = { ...movement, right: false };
      break;
    case KEYS.DOWN:
    case KEYS.S:
      movement = { ...movement, down: false };;
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
  Object.values(players).forEach((player) => {
    sprites.bird.x = player.x;
    sprites.bird.y = player.y;
    draw();
  });
  frames++;
  update();
});

setInterval(function() { socket.emit('movement', movement) }, 1000 / 60);