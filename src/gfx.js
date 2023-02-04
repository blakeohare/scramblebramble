const createGfx = (gameContext) => {

  let gfx = {};
  let { screenCtx } = gameContext;

  const [HEX, HEX_HASH] = (() => {
    let h = [];
    let hex = '0123456789abcdef';
    let _;
    for (let i = 0; i < 256; i++) {
      let v = hex[i >> 4] + hex[i & 15];
      h.push(v);
    }
    return [h, h.map(v => '#' + v)];
  })();

  gfx.rectangle = (left, top, width, height, r, g, b, a) => {
    if (a <= 0) return gfx;
    screenCtx.fillStyle = HEX_HASH[r & 255] + HEX[g & 255] + HEX[b & 255];
    if (a === undefined || a >= 255) {
      screenCtx.fillRect(left, top, width, height);
    } else {
      screenCtx.globalAlpha = (a & 255) / 255.0;
      screenCtx.fillRect(left, top, width, height);
      screenCtx.globalAlpha = 1.0;
    }
    return gfx;
  };

  gfx.fill = (r, g, b) => {
    return gfx.rectangle(0, 0, gameContext.width, gameContext.height, r, g, b, 255);
  };

  gfx.ellipse = (left, top, width, height, r, g, b, a) => {
    if (a <= 0) return gfx;
    let useAlpha = a !== undefined && a < 255;
    if (useAlpha) screenCtx.globalAlpha = (a & 255) / 255.0;
    screenCtx.fillStyle = HEX_HASH[r & 255] + HEX[g & 255] + HEX[b & 255];

    let cx = left + width / 2.0;
    let cy = top + height / 2.0;

    screenCtx.beginPath();
    screenCtx.ellipse(cx, cy, width / 2.0, height / 2.0, 0.0, 0.0, Math.PI * 2);
    screenCtx.fill();

    if (useAlpha) screenCtx.globalAlpha = 1.0;

    return gfx;
  };

  gfx.drawImage = (img, x, y) => {
    screenCtx.drawImage(img, x, y);
    return gfx;
  };

  const TEXT_SIZE = {
    S: '10px',
    M: '16px',
    L: '24px',
    XL: '36px',
  };

  gfx.drawText = (text, size, x, y, r, g, b) => {
    screenCtx.font = TEXT_SIZE[size] + " sans-serif";
    screenCtx.fillStyle = HEX_HASH[r & 255] + HEX[g & 255] + HEX[b & 255];
    screenCtx.fillText(text, x, y);
  };

  gfx.getImage = (path) => {
    return gameContext.imageLookup[path];
  };

  return Object.freeze(gfx);
};
