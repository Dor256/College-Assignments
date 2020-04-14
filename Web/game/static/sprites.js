const baseSprite = new Image();
const playerOne = new Image();
const playerTwo = new Image();
baseSprite.src = "static/assets/img/sprite.png";
playerOne.src = "static/assets/img/playerOne.png";
playerTwo.src = "static/assets/img/playerTwo.png";

function getSprites(canvas, ctx, state) {
  const background = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: canvas.height - 226,
    draw() {
      ctx.drawImage(baseSprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
      ctx.drawImage(baseSprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
  };

  const foreground = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: canvas.height - 112,
    dx: 2,
    draw() {
      ctx.drawImage(baseSprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
      ctx.drawImage(baseSprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    update() {
      if (state.current == state.game) {
        this.x = (this.x - this.dx) % (this.w / 2);
      }
    }
  };

  const getReady = {
    sX: 744,
    sY: 483,
    w: 120,
    h: 100,
    x: canvas.width / 2 - 105 / 2,
    y: 150,
    draw() {
      if (state.current == state.getReady) {
        ctx.drawImage(playerOne, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
      }
    }
  };
  
  const bird = {
    animation: [
        [
          { sX: 253, sY: 214 },
          { sX: 125, sY: 278 },
          { sX: 253, sY: 279 },
          { sX: 125, sY: 278 }
        ],
        [
          { sX: 517, sY: 113 },
          { sX: 517, sY: 301 },
          { sX: 447, sY: 510 },
          { sX: 517, sY: 301 }
        ]
    ],
    deadAnimation: [{ sX: 190, sY: 210 }, { sX: 517, sY: 208 }],
    dead: false,
    w: 55,
    h: 50,
    x: 50,
    y: 150,
    radius: 20,
    frame: 0,
    speed: 0,
    gravity: 0,
    jump: 0,
    rotation: 0,
    draw(player) {
      const bird = player.dead ? this.deadAnimation[player.no] : this.animation[player.no][this.frame];
      const sprite = player.no == 0 ? playerOne : playerTwo;
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    },
    update() {
      const atMenu = state.current == state.getReady;
      this.period = FAST_FLAP;
      this.frame += frames % this.period == 0 ? 1 : 0;
      this.frame = this.frame % this.animation[0].length;

      if (atMenu) {
        this.rotation = 0 * DEGREE;
        this.y = 150;
      } else {
        this.speed += this.gravity;
        if (this.birdHitGround()) {
          if (state.current == state.game) {
            state.current = state.over;
            sounds.DIE.play();
          }
        }
      }
    },
    flap(x, y) {
      if (!this.birdHitTop(y)) {
        this.y = y;
      }
      if (!this.birdHitRightEdge(x) && !this.birdHitLeftEdge(x)) {
        this.x = x;
      }
    },
    playerHitGround(player) {
      return player.y + this.h / 2 >= canvas.height - foreground.h;
    },
    birdHitGround() {
      return this.y + this.h / 2 >= canvas.height - foreground.h;
    },
    birdHitTop(y) {
      return y - this.radius <= canvas.getBoundingClientRect().top;
    },
    birdHitRightEdge(x) {
      return x + this.radius >= canvas.getBoundingClientRect().width;
    },
    birdHitLeftEdge(x) {
      return x - this.radius <= 0;
    },
    resetSpeed() {
      bird.speed = 0;
    }
  };

  const pipes = {
    bottom: {
      sX: 502,
      sY: 0
    },
    top: {
      sX: 553,
      sY: 0
    },
    w: 53,
    h: 400,
    gap: 150,
    dx: 2,
    position: [],
    maxYPos: -175,
    draw() {
      this.position.forEach((pipe) => {
        const topY = pipe.y;
        const bottomY = pipe.y + this.h + this.gap;

        ctx.drawImage(baseSprite, this.top.sX, this.top.sY, this.w, this.h, pipe.x, topY, this.w, this.h);
        ctx.drawImage(baseSprite, this.bottom.sX, this.bottom.sY, this.w, this.h, pipe.x, bottomY, this.w, this.h);
      });
    },
    update(players, calc) {
      if (state.current !== state.game) {
        return;
      }
      if (frames % 100 == 0) {
        this.position.push({ x: canvas.width, y: this.maxYPos * calc });
      }
      this.position.forEach((pipe) => {
        pipe.x -= this.dx;
        Object.entries(players).forEach(([id, player]) => {
          if (this.birdHasCollided(pipe, player)) {
            // state.current = state.over;
            socket.emit('death', id);
            sounds.HIT.play();
          }
        });
        if (pipe.x + this.w <= 0) {
          this.position.shift();
          score.value++;
          sounds.SCORE.play();
          score.best = Math.max(score.value, score.best);
          localStorage.setItem("best", score.best);
        }
      });
    },
    birdHasCollided(pipe, player) {
      const bottomPipeY = pipe.y + this.gap + this.h;
      return (player.x + bird.radius > pipe.x && player.x -bird.radius < pipe.x + this.w && player.y + bird.radius > pipe.y && player.y - bird.radius < pipe.y + this.h) 
        || (player.x + bird.radius > pipe.x && player.x - bird.radius < pipe.x + this.w && player.y + bird.radius > bottomPipeY && player.y - bird.radius < bottomPipeY + this.h);
    },
    reset() {
      pipes.position = [];
    }
  };

  const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,
    draw() {
      ctx.fillStyle = Colors.WHITE;
      ctx.strokeStyle = Colors.BLACK;

      if (state.current == state.game) {
        ctx.lineWidth = 2;
        ctx.font = "35px Teko";
        ctx.fillText(this.value, canvas.width / 2, 50);
        ctx.strokeText(this.value, canvas.width / 2, 50);
      } else if (state.current == state.over) {
        ctx.font = "25px Teko";
        ctx.fillText(this.value, 225, 186);
        ctx.strokeText(this.value, 225, 186);
        ctx.fillText(this.best, 225, 228);
        ctx.strokeText(this.best, 225, 228);
      }
    },
    reset() {
      score.value = 0;
    }
  };

  const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: canvas.width / 2 - 225 / 2,
    y: 90,
    draw() {
      if (state.current == state.over) {
        ctx.drawImage(baseSprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
      }
    }
  };

  const bauble = {
    sX: 391,
    sY: 78,
    w: 55,
    h: 50,
    draw() {
      if (state.current != state.over) {
      }
    }
  };

  const hostile = {
    sX: 410,
    sY: 218,
    w: 65,
    h: 30,
    draw() {
      if (state.current != state.over) {
      }
    }
  };
  
  return { background, foreground, bird, getReady, gameOver, pipes, score, hostile, bauble };
};

