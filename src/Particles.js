class FallingSeed {
  constructor(targetTile) {
    this.renderX = null;
    this.renderY = null;
    this.tile = targetTile;
    this.fallCounter = FPS;
    this.dead = false;
    this.tile.enableFallingShadow(this);
  }

  update(scene) {
    this.fallCounter--;
    if (this.fallCounter <= 0) {
      this.dead = true;
      this.tile.plantSeed(this);
    }
  }

  render(gfx, rc) {
    let x = this.tile.actualX;
    let y = this.tile.actualY;
    y += Math.floor(HEIGHT * this.fallCounter / FPS)
  }
}

class Debris {
  constructor(x, y, vx, vy, lifeSpan, behavior, enableFade) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.lifeSpan = lifeSpan;
    this.fullLifeSpan = lifeSpan;
    this.dead = false;
    this.behavior = behavior;
    this.enableFade = !!enableFade;
  }

  update(scene) {
    if (this.lifeSpan-- <= 0) {
      this.dead = true;
    }

    switch (this.behavior || '') {

      

      case 'FLY':
      default: 
        this.x += this.vx;
        this.y += this.vy;
        break;
    }
  }

  render(gfx, rc) {
    let a = 255;
    if (this.enableFade) {
      a = Math.max(0, Math.min(255, Math.floor(this.lifeSpan / this.fullLifeSpan)));
    }
    gfx.rectangle(Math.floor(this.x) - 1, Math.floor(this.y) - 1, 2, 2, this.r, this.g, this.b, a);
  }
}