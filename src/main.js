let setNextScene = null;

window.addEventListener('load', async () => {
  window.addEventListener('contextmenu', e => e.preventDefault());
 
  let screen = document.getElementById('screen');
  screen.style.position = 'absolute';
  screen.width = WIDTH;
  screen.height = HEIGHT;

  let screenCtx = screen.getContext('2d');
  screenCtx.imageSmoothingEnabled = false;
  screen.style.imageRendering = 'pixelated';

  let updateSize = () => {
    let realWidth = window.innerWidth;
    let realHeight = window.innerHeight;
    let gameRatio = WIDTH / HEIGHT;
    let realRatio = realWidth / realHeight;
    let canvasWidth = realWidth;
    let canvasHeight = realHeight;
    if (realRatio > gameRatio) {
      // add vertical bars
      canvasWidth = realHeight * gameRatio;
    } else {
      // add horizontal bars
      canvasHeight = realWidth / gameRatio;
    }
    let style = screen.style;
    style.position = 'absolute';
    style.width = Math.floor(canvasWidth) + 'px';
    style.height = Math.floor(canvasHeight) + 'px';
    style.left = Math.floor((realWidth - canvasWidth) / 2) + 'px';
    style.top = Math.floor((realHeight - canvasHeight) / 2) + 'px';
  };
  updateSize();

  window.addEventListener('resize', updateSize);

  let gameContext = {
    events: [],
    screen, 
    screenCtx,
    activeScene: null,
    nextScene: null,
    renderCounter: 1,
    width: WIDTH,
    height: HEIGHT,
    fps: FPS,
    gfx: null,
  };

  let handleMouse = (ev, isMove, isDown) => {
    let { left, top, width, height } = screen.getBoundingClientRect();
    let x = ev.clientX;
    let y = ev.clientY;
    let px = x - left;
    let py = y - top;
    let mx = Math.floor(Math.max(0, Math.min(1, px / width)) * WIDTH);
    let my = Math.floor(Math.max(0, Math.min(1, py / height)) * HEIGHT);

    gameContext.events.push({
      type: isMove ? 'MOVE' : isDown ? 'TAP' : 'RELEASE',
      x: mx, 
      y: my,
    });
  
  };

  window.addEventListener('mousedown', ev => handleMouse(ev, false, true));
  window.addEventListener('mouseup', ev => handleMouse(ev, false, false));
  window.addEventListener('mousemove', ev => handleMouse(ev, true, false));

  window.addEventListener('keydown', ev => handleKey(ev, true));
  window.addEventListener('keyup', ev => handleKey(ev, false));

  let keyConversion = { 
    ' ': 'SPACE', 
    'ARROWLEFT': 'LEFT',
    'ARROWRIGHT': 'RIGHT',
    'ARROWUP': 'UP',
    'ARROWDOWN': 'DOWN',
  };
  let handleKey = (ev, isDown) => {
    let key = ev.key.toUpperCase();
    gameContext.events.push({
      type: isDown ? 'KEYDOWN' : 'KEYUP',
      key: keyConversion[key] || key,
    });
  };

  let loadImage = async (path) => {
    return new Promise(res => {
      let imgElement = document.createElement('img');
      imgElement.addEventListener('load', () => {
        let canvas = document.createElement('canvas');
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        let canvasCtx = canvas.getContext('2d');
        canvasCtx.drawImage(imgElement, 0, 0);
        res(canvas);
      });
      imgElement.src = path;
    });
  };

  let loadImages = async (paths) => {
    return Promise.all(paths.map(loadImage));
  };

  let imagePaths = IMAGES.split('\n').map(v => v.trim()).filter(v => !!v);
  let allImages = await loadImages(imagePaths);
  let imageLookup = {};
  for (let i = 0; i < imagePaths.length; i++) {
    imageLookup[imagePaths[i]] = allImages[i];
  }

  gameContext.imageLookup = imageLookup;

  gameContext.gfx = createGfx(gameContext);

  let gameLoop = () => {
    let start = new Date().getTime();

    gameContext.activeScene.update([...gameContext.events]);
    gameContext.events = [];

    gameContext.gfx.fill(0, 0, 0);
    gameContext.activeScene.render(gameContext.gfx, gameContext.renderCounter++);

    gameContext.activeScene = gameContext.nextScene || gameContext.activeScene;

    let end = new Date().getTime();
    let diff = end - start;
    let delay = Math.floor(1000 / FPS - diff + 0.5);
    window.setTimeout(gameLoop, delay);
  };
  setNextScene = scene => {
    gameContext.nextScene = scene;
  };

  gameContext.activeScene = new TitleScene();
  window.setTimeout(gameLoop, 1);
});
