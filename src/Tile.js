const TILE_WIDTH = 74;
const TILE_HEIGHT = 79;

const JOLT_ANIM_DURATION = FPS / 6;
class Tile {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.state = 'CLEAN'; // { CLEAN | FALLING | DROPPED | SPROUT | CONNECTED }
    
    this.actualX = Infinity;
    this.actualY = Infinity;

    this.joltCounter = -1;

    this.neighbors = {
      NW: null,
      NE: null,
      W: null,
      E: null,
      SW: null,
      SE: null,
    };

    this.px = col * TILE_WIDTH + (row % 2) * 37;
    this.py = row * Math.floor(TILE_HEIGHT * 3 / 4);

    this.width = TILE_WIDTH;
    this.height = TILE_HEIGHT;
    
    this.offsetX = 0;
    this.offsetY = 0;
    
    this.seed = null;
    this.images = null;
    this.stateCounter = 0;
  }

  setState(newState) {
    this.stateCounter = 0;
    this.state = newState;
  }

  update() {
    this.stateCounter++;
    this.joltCounter--;
    if (this.joltCounter <= 0) {
      this.offsetY = 0;
    } else {
      this.offsetY = -Math.floor(15 * Math.sin(Math.PI * this.joltCounter / JOLT_ANIM_DURATION));
    }
    this.offsetX = 0;
    

    switch (this.state) {
      case 'DROPPED':
        if (this.stateCounter > FPS * 2) {
          this.setState('SPROUT');
        }
        break;
    }
  }

  jolt() {
    this.joltCounter = JOLT_ANIM_DURATION;
  }

  enableFallingShadow(seed) {
    this.seed = seed;
    this.setState('FALLING');
  }

  plantSeed(seed) {
    this.seed = null;
    this.setState('DROPPED');
  }

  render(gfx, rc, x, y) {
    if (this.images === null) {
      this.images = {
        CLEAN: gfx.getImage('images/green_tile.png'),
        INFECTED: gfx.getImage('images/infected_tile.png'),
        CONNECTED: gfx.getImage('images/connected_tile.png'),
      };
    } 
    let bg = null;
    let shadowSize = 0;
    switch (this.state) {
      case 'CLEAN':
        bg = this.images.CLEAN;
        break;
      case 'FALLING':
        bg = this.images.CLEAN;
        shadowSize = 4;
        break;
      case 'DROPPED':
        bg = this.images.CLEAN;
        break;
      case 'SPROUT':
        bg = this.images.INFECTED;
        break;
      case 'CONNECTED':
        bg = this.images.CONNECTED;
        break;
      default: throw new Error();
    }

    gfx.drawImage(bg, x, y);
  }
}
