const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let frames = 0;

const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2
};

const sprites = getSprites(canvas, ctx, state);

canvas.addEventListener('click', function(event) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      break;
    case state.game:
      sprites.bird.flap();
      break;
    case state.over:
      state.current = state.getReady;
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

function loop() {
  update();
  draw();
  frames++;
  requestAnimationFrame(loop);
};

loop();