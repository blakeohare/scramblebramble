class FallingSeed {
  constructor(targetTile, scene) {
    this.renderX = null;
    this.renderY = null;
    this.tile = targetTile;
    this.fallCounter = FPS;
    this.dead = false;
    this.tile.enableFallingShadow(this, scene);
    this.image = null;
  }

  update(scene) {
    this.fallCounter--;
    if (this.fallCounter <= 0) {
      this.dead = true;
      this.tile.plantSeed(this, scene);
    }
  }

  render(gfx, rc) {
    this.image = this.image || gfx.getImage('images/seed.png');
    this.renderX = this.tile.actualX - this.image.width / 2;
    this.renderY = this.tile.actualY - this.image.height;
    this.renderY -= Math.floor(HEIGHT * this.fallCounter / FPS)

    gfx.drawImage(this.image, this.renderX, this.renderY);
  }
}

class Debris {
  constructor(x, y, vx, vy, lifeSpan, behavior, enableFade, r, g, b) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.lifeSpan = lifeSpan;
    this.fullLifeSpan = lifeSpan;
    this.dead = false;
    this.behavior = behavior;
    this.enableFade = !!enableFade;
    this.r = r;
    this.g = g;
    this.b = b;
  }

  update(scene) {
    if (this.lifeSpan-- <= 0) {
      this.dead = true;
    }

    switch (this.behavior || '') {

      case 'FALL':
        this.x += this.vx;
        this.y += this.vy;
        this.vy += .7;
        break;

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
      a = Math.max(0, Math.min(255, Math.floor(255 * this.lifeSpan / this.fullLifeSpan)));
    }
    gfx.rectangle(Math.floor(this.x) - 1, Math.floor(this.y) - 1, 2, 2, this.r, this.g, this.b, a);
  }
}