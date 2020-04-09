const baseSprite = new Image();
const extraSprite = new Image();
baseSprite.src = "static/assets/img/sprite.png";
extraSprite.src = "static/assets/img/tinySprite.png";

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
        ctx.drawImage(extraSprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
      }
    }
  };
  
  const bird = {
    animation: [
      { sX: 253, sY: 214 },
      { sX: 125, sY: 278 },
      { sX: 253, sY: 279 },
      { sX: 125, sY: 278 }
    ],
    dead: { sX: 190, sY: 216 },
    w: 55,
    h: 50,
    x: 50,
    y: 156,
    radius: 20,
    frame: 0,
    speed: 0,
    gravity: 0.25,
    jump: 4.6,
    rotation: 0,
    draw() {
      const bird = state.current == state.over ? this.dead : this.animation[this.frame];
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.drawImage(extraSprite, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    },
    update() {
      const atMenu = state.current == state.getReady;
      this.period = atMenu ? SLOW_FLAP : FAST_FLAP;
      this.frame += frames % this.period == 0 ? 1 : 0;
      this.frame = this.frame % this.animation.length;

      if (atMenu) {
        this.rotation = 0 * DEGREE;
        this.y = 150;
      } else {
        this.speed += this.gravity;
        if (this.birdHitGround()) {
          this.y = canvas.height - foreground.h - this.h / 2;
          if (state.current == state.game) {
            state.current = state.over;
            sounds.DIE.play();
          }
        } else {
          this.y += this.speed;
        }
        if (this.birdIsFalling()) {
          this.rotation = 90 * DEGREE;
          this.frame = 1;
        } else {
          this.rotation = -25 * DEGREE;
        }
      }
    },
    flap(flap) {
      if (flap && !this.birdHitTop()) {
        this.speed = -this.jump;
      }
    },
    birdHitGround() {
      return this.y + this.h / 2 >= canvas.height - foreground.h;
    },
    birdIsFalling() {
      return this.speed >= this.jump;
    },
    birdHitTop() {
      return this.y - this.radius <= canvas.getBoundingClientRect().top;
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
    update() {
      if (state.current !== state.game) {
        return;
      }
      if (frames % 100 == 0) {
        this.position.push({ x: canvas.width, y: this.maxYPos * (Math.random() + 1) });
      }
      this.position.forEach((pipe) => {
        pipe.x -= this.dx;
        if (this.birdHasCollided(pipe)) {
          state.current = state.over;
          sounds.HIT.play();
        }
        if (pipe.x + this.w <= 0) {
          this.position.shift();
          score.value++;
          sounds.SCORE.play();
          score.best = Math.max(score.value, score.best);
          localStorage.setItem("best", score.best);
        }
      });
    },
    birdHasCollided(pipe) {
      const bottomPipeY = pipe.y + this.gap + this.h;
      return (bird.x + bird.radius > pipe.x && bird.x -bird.radius < pipe.x + this.w && bird.y + bird.radius > pipe.y && bird.y - bird.radius < pipe.y + this.h) 
        || (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + this.w && bird.y + bird.radius > bottomPipeY && bird.y - bird.radius < bottomPipeY + this.h);
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
  
  return { background, foreground, bird, getReady, gameOver, pipes, score };
};

