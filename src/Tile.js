const TILE_WIDTH = 74;
const TILE_HEIGHT = 79;

const JOLT_ANIM_DURATION = FPS / 6;
const ROOT_SPREAD_COUNTER = Math.floor(FPS * 1.2);

class Tile {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.state = 'CLEAN'; // { CLEAN | FALLING | DROPPED | SPROUT | CONNECTED }

    this.actualX = Infinity;
    this.actualY = Infinity;

    this.joltCounter = -1;

    this.dirs = 'NW NE E SE SW W'.split(' ');
    this.dirInvert = {};
    for (let i = 0; i < 6; i++) {
      this.dirInvert[this.dirs[i]] = this.dirs[(i + 3) % 6];
    }

    this.rootSproutStatus = {};
    this.fullRootStatus = {};
    this.incomingRootStatus = {};
    this.spreadCounter = Math.floor(FPS * 1.2);

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

  spreadFurther() {
    this.spreadCounter = ROOT_SPREAD_COUNTER;
    let validDirs = this.dirs.filter(dir => !!this.neighbors[dir]);
    let spreadDir = validDirs[Math.floor(Math.random() * validDirs.length)];
    if (this.fullRootStatus[spreadDir]) {
        let targetTile = this.neighbors[spreadDir];
        targetTile.fullRootStatus[this.dirInvert[spreadDir]] = true; // register the opposite direction as fulfilled
    } else {
      this.fullRootStatus[spreadDir] = true;
      // incoming root status is updated speparately in a canonicalize-pass
    }
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
          this.dirs.forEach(dir => { this.rootSproutStatus[dir] = true; });
        }
        break;
      case 'SPROUT':
        if (this.spreadCounter-- <= 0) {
          this.spreadFurther();
        }
        break;
    }
  }

  fixIncomingConnections() {
    for (let dir of this.dirs) {
      let neighbor = this.neighbors[dir];
      let inv = this.dirInvert[dir];
      if (neighbor) {
        let hasFull = this.fullRootStatus[dir];
        let nHasFull = neighbor.fullRootStatus[inv];

        if (hasFull && nHasFull) {
          // nothing
        } else if (hasFull) {
          neighbor.incomingRootStatus[inv] = true;
        } else if (nHasFull) {
          this.incomingRootStatus[dir] = true;
        }
      }
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
      let images = {
        CLEAN: gfx.getImage('images/green_tile.png'),
        INFECTED: gfx.getImage('images/infected_tile.png'),
        CONNECTED: gfx.getImage('images/connected_tile.png'),
        SEED: gfx.getImage('images/seed.png'),
        ROOT_ALL: gfx.getImage('images/root_full.png'),
        ROOT_BIG: {},
        ROOT_SMALL: {},
        ROOT_INCOMING: {},
      };
      this.dirs.forEach(dir => {
        images.ROOT_BIG[dir] = gfx.getImage('images/roots/root_' + dir.toLowerCase() + '.png');
        images.ROOT_SMALL[dir] = gfx.getImage('images/roots/root_' + dir.toLowerCase() + '_sml.png');
        images.ROOT_INCOMING[dir] = gfx.getImage('images/roots/root_' + dir.toLowerCase() + '_incoming.png');
      });
      this.images = { ...images };
    }
    let bg = null;
    let showRoots = false;
    let shadowSize = 0;
    let plant = null;
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
        plant = this.images.SEED;
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
    for (let dir of this.dirs) {
      if (this.fullRootStatus[dir]) {
        gfx.drawImage(this.images.ROOT_BIG[dir], x, y);
      } else {
        if (this.incomingRootStatus[dir]) {
          gfx.drawImage(this.images.ROOT_INCOMING[dir], x, y);
        }
        if (this.rootSproutStatus[dir]) {
          gfx.drawImage(this.images.ROOT_SMALL[dir], x, y);
        }
      }
    }

    if (plant) {
      let px = Math.floor(x + TILE_WIDTH / 2 - plant.width / 2);
      let py = Math.floor(y + TILE_HEIGHT / 2) - plant.height;
      gfx.drawImage(plant, px, py);
    }
  }
}
