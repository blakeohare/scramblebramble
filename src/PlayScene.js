class PlayScene {
  constructor() {
    this.grid = Util.makeGrid(8, 8);
    this.width = this.grid.length;
    this.height = this.grid[0].length;
    this.tileLocCache = {};

    this.seedDropCountdown = 0;
    this.seedDropDelay = FPS * 3;

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

  update(events) {

    if (this.seedDropCountdown-- <= 0) {
      this.seedDropDelay *= 0.99;
      this.seedDropCountdown = Math.floor(FPS / 6 + this.seedDropDelay);
      let availableTiles = this.allTiles.filter(t => t.state === 'CLEAN');
      if (availableTiles.length === 0) {
        console.log("YOU LOSE");
      } else {   
        let tile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
        this.sprites.push(new FallingSeed(tile));
        
      }
    }

    for (let ev of events) {
      if (ev.type === 'TAP') {
        let tile = this.hitTest(ev.x, ev.y);
        if (tile) tile.jolt();
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
      tile.update();
    }

    // canonicalize tile connections
    for (let tile of this.allTiles) {
      tile.fixIncomingConnections();
    }
  }

  render(gfx, rc) {

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
  }
}
