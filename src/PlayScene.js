const SCORE_X = 10;
const SCORE_Y = 150;

class PlayScene {
  constructor() {
    this.grid = Util.makeGrid(8, 8);
    this.width = this.grid.length;
    this.height = this.grid[0].length;
    this.tileLocCache = {};

    this.score = 0;

    this.seedDropCountdown = 1;
    this.seedDropDelay = STARTING_SEED_DROP_DELAY;
    this.rootSpreadCounter = INITIAL_ROOT_SPREAD_COUNTER;

    this.infectionCount = 0;

    this.sprites = [];

    let allTilesLookup = {};
    this.allTiles = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let tile = new Tile(x, y);;
        this.grid[x][y] = tile;
        allTilesLookup[x + ',' + y] = tile;
        this.allTiles.push(tile);
      }
    }

    Object.values(allTilesLookup).forEach(tile => {
      let { col, row } = tile;
      tile.neighbors.W = allTilesLookup[(col - 1) + ',' + row] || null;
      tile.neighbors.E = allTilesLookup[(col + 1) + ',' + row] || null;

      let westX = row % 2 === 0 ? (col - 1) : col;
      let northY = row - 1;
      let eastX = westX + 1;
      let southY = row + 1;

      tile.neighbors.NW = allTilesLookup[westX + ',' + northY] || null;
      tile.neighbors.NE = allTilesLookup[eastX + ',' + northY] || null;
      tile.neighbors.SW = allTilesLookup[westX + ',' + southY] || null;
      tile.neighbors.SE = allTilesLookup[eastX + ',' + southY] || null;
    });
  }

  hitTest(x, y) {
    let closest = null;
    let closestDistSq = Infinity;
    for (let tile of this.allTiles) {
      let dx = tile.actualX - x;
      let dy = tile.actualY - y;
      let distSq = dx * dx + dy * dy;
      if (closest === null || distSq < closestDistSq) {
        closest = tile;
        closestDistSq = distSq;
      }
    }

    if (closest !== null) {
      if (Math.sqrt(closestDistSq) <= TILE_WIDTH / 2) {
        return closest;
      }
    }
    return null;
  }

  getRootSpreadCounterDuration() {
    this.rootSpreadCounter *= ROOT_SPREAD_COUNTER_DECAY;
    return Math.max(ROOT_SPREAD_COUNTER_MINIMUM, this.rootSpreadCounter);
  }

  incrementScore() {
    this.score++;

    Util.createDebrisBurst(this, SCORE_X + 29 * ((this.score + "").length / 2), SCORE_Y + 20, 200, false, 255, 255, 255, true);
  }

  update(events) {

    if (this.seedDropCountdown-- <= 0) {
      this.seedDropDelay *= SEED_DROP_DECAY_PER_DROP;
      this.seedDropCountdown = Math.floor(this.seedDropDelay);
      this.seedDropCountdown *= SEED_DROP_OVERALL_SPEED_RATIO;
      this.seedDropCountdown = Math.max(SEED_DROP_MINIMUM_VALUE, this.seedDropCountdown);

      let availableTiles = this.allTiles.filter(t => t.state === 'CLEAN');
      if (availableTiles.length) {
        let tile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
        this.sprites.push(new FallingSeed(tile, this));
      }
    }

    let lose = false;
    for (let ev of events) {
      if (ev.type === 'TAP') {
        let tile = this.hitTest(ev.x, ev.y);
        if (tile) {
          tile.attackPlant(this);
          Util.createDebrisBurst(this, tile.actualX, tile.actualY, 40, true, 80, 40, 20);
        }
      }
      if (ev.type === 'KEYDOWN' && ev.key === 'F') {
        lose = true;
      }
    }

    let newSprites = [];
    for (let sprite of this.sprites) {
      sprite.update(this);
      if (!sprite.dead) {
        newSprites.push(sprite);
      }
    }
    this.sprites = newSprites;

    for (let tile of this.allTiles) {
      tile.update(this);
    }
    
    // 2nd pass
    let notConnected = 0;
    let notGreen = 0;
    for (let tile of this.allTiles) {
      tile.fixConnections();
      
      if (tile.state !== 'CONNECTED') {
        notConnected++;
      }
      if (tile.state !== 'CLEAN') {
        notGreen++;
      }
    }
    
    if (notConnected === 0) {
      lose = true;
    }

    if (lose) {
      setNextScene(new ScoreScreen(this, this.score));
    }

    this.infectionCount = this.allTiles.length - notConnected;
    this.isCascade = notGreen / this.allTiles.length >= RATIO_FOR_CASCADE;
  }

  render(gfx, rc) {

    gfx.fill(0, 90, 20);

    let left = Math.floor((WIDTH - (this.grid.length + 0.5) * TILE_WIDTH) / 2);
    let top = 40;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let tile = this.grid[x][y];
        let px = tile.px + left + tile.offsetX;
        let py = tile.py + top + tile.offsetY;
        tile.render(gfx, rc, px, py);
        tile.actualX = px + (TILE_WIDTH >> 1);
        tile.actualY = py + (TILE_HEIGHT >> 1);
      }
    }

    for (let sprite of this.sprites) {
      sprite.render(gfx, rc);
    }

    {
      gfx.drawImage(gfx.getImage('images/ui/score.png'), 10, 100);
      let chars = ("" + this.score).split("");
      let x = SCORE_X;
      let y = SCORE_Y; 
      for (let char of chars) {
        let img = gfx.getImage('images/ui/nums/' + char + '.png');
        gfx.drawImage(img, x, y);
        x += img.width - 6;
      }
    }
  }
}
