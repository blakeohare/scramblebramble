const Util = (() => {
  
  let makeGrid = (w, h) => {
    let output = [];
    let row = [];
    while (h --> 0) {
      row.push(null);
    }
    while (w --> 0) {
      output.push([...row]);
    }
    return output;
  };
  
  let randomChoice = arr => {
    if (arr.length) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    return null;
  };

  let getData = (key) => {
    try {
      let value = window.localStorage.getItem(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  };

  let setData = (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (ex) {
      // do nothing
    }
  };

  let createDebrisBurst = (scene, x, y, amount, useGravity, r, g, b, useFade) => {
    for (let i = 0; i < amount; i++) {
      let angle = Math.random() * 2 * Math.PI;
      let radius = Math.random() * 10;
      let vx = Math.cos(angle) * 3;
      let vy = Math.sin(angle) * 3;
      let ax = x + Math.cos(angle) * radius;
      let ay = y + Math.sin(angle) * radius;
      if (useGravity) {
        vy -= 5;
      }
      scene.sprites.push(new Debris(ax, ay, vx, vy, FPS / 4, useGravity ? 'FALL' : 'FLY', !!useFade, r, g, b));
    }
  };

  return Object.freeze({
    createDebrisBurst,
    getData,
    makeGrid,
    randomChoice,
    setData,
  });
})();

