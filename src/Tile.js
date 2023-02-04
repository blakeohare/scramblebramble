const TILE_WIDTH = 74;
const TILE_HEIGHT = 79;


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
    this.spreadCounter = Math.floor(FPS);

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
    this.pulseCounter = Math.floor(Math.random() * 10000);
  }

  setState(newState, scene) {
    this.stateCounter = 0;
    this.spreadCounter = ROOT_SPREAD_COUNTER_FIRST; 
    if (scene.isCascade) this.spreadCounter = 8;

    if (newState === 'CLEAN' && this.state !== 'CLEAN') {
      scene.incrementScore();
    }
    this.state = newState;
    if (this.state === 'CLEAN') {
      this.seed = null;
      this.rootSproutStatus = {};
      this.fullRootStatus = {};
    }
  }

  spreadFurther(scene) {
    this.spreadCounter = scene.getRootSpreadCounterDuration();
    let validDirs = this.dirs.filter(dir => !!this.neighbors[dir]);
    let spreadDir = validDirs[Math.floor(Math.random() * validDirs.length)];
    if (this.fullRootStatus[spreadDir]) {
        let targetTile = this.neighbors[spreadDir];
        targetTile.fullRootStatus[this.dirInvert[spreadDir]] = true; // register the opposite direction as fulfilled
        if (targetTile.state !== 'CONNECTED') {
          targetTile.setState('CONNECTED', scene);
        }
        if (this.state !== 'CONNECTED') {
          this.setState('CONNECTED', scene);
        }
    } else {
      this.fullRootStatus[spreadDir] = true;
      // incoming root status is updated speparately in a canonicalize-pass
    }
  }

  update(scene) {
    this.stateCounter++;
    this.joltCounter--;
    if (this.joltCounter <= 0) {
      this.offsetY = 0;
    } else {
      this.offsetY = -Math.floor(15 * Math.sin(Math.PI * this.joltCounter / JOLT_ANIM_DURATION));
    }
    this.offsetX = 0;

    this.offsetY += Math.floor(Math.cos(this.pulseCounter * Math.PI / FPS * 1.5) * 2 + 0.5);
    this.pulseCounter++;

    let doSpread = false;
    switch (this.state) {
      case 'DROPPED':
        if (this.stateCounter > FPS * .3) {
          this.setState('SPROUT', scene);
          this.dirs.forEach(dir => { this.rootSproutStatus[dir] = true; });
        }
        break;
      case 'SPROUT':
        doSpread = true;
        break;
      case 'CONNECTED':
        doSpread = true;
        break;
    }

    if (doSpread) {
      if (this.spreadCounter-- <= 0) {
        this.spreadFurther(scene);
      }
    }
  }

  fixConnections() {
    let hasAnyOutgoing = false;
    for (let dir of this.dirs) {
      if (!hasAnyOutgoing && this.fullRootStatus[dir]) hasAnyOutgoing = true;

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
        } else {
          this.incomingRootStatus[dir] = false;
        }
      }
    }

    if (hasAnyOutgoing) {
      for (let dir of this.dirs) {
        this.rootSproutStatus[dir] = true;
      }
    }
  }

  jolt() {
    this.joltCounter = JOLT_ANIM_DURATION;
  }

  enableFallingShadow(seed, scene) {
    this.seed = seed;
    this.setState('FALLING', scene);
  }

  plantSeed(seed, scene) {
    this.seed = null;
    this.setState('DROPPED', scene);
  }

  attackPlant(scene) {
    this.jolt();
    let choices = [];
    for (let dir of this.dirs) {
      if (this.fullRootStatus[dir]) {
        choices.push(dir);
      }
    }
    let attackDir = Util.randomChoice(choices);
    if (attackDir) {
      this.fullRootStatus[attackDir] = false;

    } else {
      if (this.state === 'CONNECTED') {
        this.setState('SPROUT', scene);
      } else if (this.state === 'SPROUT' || this.state === 'DROPPED') {
        this.setState('CLEAN', scene);
      } 
    }

    this.fixConnections();
    for (let dir of this.dirs) {
      let neighbor = this.neighbors[dir];
      if (neighbor) {
        neighbor.fixConnections();
      }
    }
  }

  render(gfx, rc, x, y) {
    if (this.images === null) {
      let images = {
        CLEAN: gfx.getImage('images/green_tile.png'),
        INFECTED: gfx.getImage('images/infected_tile.png'),
        CONNECTED: gfx.getImage('images/connected_tile.png'),
        SEED: gfx.getImage('images/seed.png'),
        ROOT_ALL: gfx.getImage('images/root_full.png'),
        SPROUT: gfx.getImage('images/sprout.png'),
        PLANT: gfx.getImage('images/plant.png'),
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
        bg = this.images.INFECTED;
        plant = this.images.SPROUT;
        break;
      case 'SPROUT':
        bg = this.images.INFECTED;
        plant = this.images.PLANT;
        break;
      case 'CONNECTED':
        bg = this.images.CONNECTED;
        plant = this.images.PLANT;
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
